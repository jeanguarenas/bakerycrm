import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';

const OrderFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ product: '', quantity: 1, price: 0, id: 'item-initial' }],
    deliveryType: 'store',
    deliveryAddress: '',
    deliveryDate: '',
    status: 'pending',
    invoiceStatus: 'remito'
  });
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para facturas abiertas del cliente
  const [openInvoices, setOpenInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Obtener clientes y productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener clientes
        const customersResponse = await fetch('/api/customers');
        if (!customersResponse.ok) {
          throw new Error('Error al cargar los clientes');
        }
        const customersData = await customersResponse.json();
        
        // Obtener productos
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error('Error al cargar los productos');
        }
        const productsData = await productsResponse.json();
        
        setCustomers(customersData);
        setProducts(productsData);
        
        // Si no hay datos para editar, establecer valores iniciales
        if (!isEditing && customersData.length > 0) {
          setFormData(prev => ({
            ...prev,
            customer: customersData[0]._id
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        if (!isEditing) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [isEditing]);

  // Si estamos editando, obtener datos del pedido
  useEffect(() => {
    if (isEditing) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(`/api/orders/${id}`);
          if (!response.ok) {
            throw new Error('No se pudo obtener los datos del pedido');
          }
          
          const data = await response.json();
          
          // Formatear los datos para el formulario
          setFormData({
            customer: data.customer._id,
            items: data.items.map(item => ({
              product: item.product._id,
              quantity: item.quantity,
              price: item.price
            })),
            deliveryType: data.deliveryType,
            deliveryAddress: data.deliveryAddress || '',
            deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString().split('T')[0] : '',
            status: data.status
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrder();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si cambia el cliente, cargar sus facturas abiertas
    if (name === 'customer' && value) {
      fetchOpenInvoices(value);
    }
  };
  
  // Función para obtener facturas abiertas del cliente seleccionado
  const fetchOpenInvoices = async (customerId) => {
    try {
      const response = await fetch(`/api/invoices/open-by-customer/${customerId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener facturas');
      }
      
      const data = await response.json();
      setOpenInvoices(data);
      
      // Resetear las facturas seleccionadas cuando cambia el cliente
      setSelectedInvoices([]);
    } catch (err) {
      console.error('Error al obtener facturas abiertas:', err);
      toast.error('No se pudieron cargar las facturas abiertas del cliente');
    }
  };
  
  // Manejar selección/deselección de facturas
  const handleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prev => {
      // Si ya está seleccionada, quitarla
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } 
      // Si no está seleccionada, agregarla
      else {
        return [...prev, invoiceId];
      }
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    newItems[index][field] = value;
    
    // Si el campo es producto, actualizar el precio con el del producto seleccionado
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        newItems[index].price = selectedProduct.price;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, price: 0, id: `item-${Date.now()}` }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };
  
  // Manejar el arrastre y soltar de elementos
  const onDragEnd = (result) => {
    // Si no hay destino, no hacemos nada
    if (!result.destination) return;
    
    const items = Array.from(formData.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormData(prev => ({
      ...prev,
      items: items
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.customer) {
      toast.error('Debe seleccionar un cliente');
      return;
    }
    
    // Verificar que todos los productos estén seleccionados
    const invalidItems = formData.items.filter(item => !item.product);
    if (invalidItems.length > 0) {
      toast.error('Todos los productos deben estar seleccionados');
      return;
    }
    
    try {
      setLoading(true);
      
      // Omitir IDs temporales de los items
      const itemsToSend = formData.items.map(({ product, quantity, price }) => ({
        product, quantity, price
      }));
      
      const dataToSend = {
        ...formData,
        items: itemsToSend
      };
      
      let response;
      let savedOrderId;
      
      if (isEditing) {
        // Actualizando un pedido existente
        response = await fetch(`/api/orders/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });
        savedOrderId = id;
        toast.success('¡Pedido actualizado correctamente!');
      } else {
        // Creando un nuevo pedido
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });
        savedOrderId = response.data._id;
        toast.success('¡Pedido creado correctamente!');
      }
      
      // Manejar asociaciones de facturas si hay seleccionadas
      if (selectedInvoices.length > 0) {
        // Primero obtenemos el estado actual del pedido para conocer sus facturas actuales
        const orderResponse = await fetch(`/api/orders/${savedOrderId}`);
        if (!orderResponse.ok) {
          throw new Error('Error al obtener detalles del pedido');
        }
        
        const orderData = await orderResponse.json();
        const currentInvoices = orderData.associatedInvoices || [];
        const currentInvoiceIds = currentInvoices.map(inv => typeof inv === 'object' ? inv._id : inv);
        
        // Determinar facturas a asociar (las nuevas que no estaban antes)
        const invoicesToAssociate = selectedInvoices.filter(
          invId => !currentInvoiceIds.includes(invId)
        );
        
        // Determinar facturas a desasociar (las que estaban antes pero ya no están seleccionadas)
        const invoicesToDisassociate = currentInvoiceIds.filter(
          invId => !selectedInvoices.includes(invId)
        );
        
        // Asociar nuevas facturas
        for (const invoiceId of invoicesToAssociate) {
          const associateResponse = await fetch(`/api/orders/${savedOrderId}/associate-invoice/${invoiceId}`, {
            method: 'POST'
          });
          
          if (!associateResponse.ok) {
            console.error(`Error al asociar factura ${invoiceId}`);
          }
        }
        
        // Desasociar facturas removidas
        for (const invoiceId of invoicesToDisassociate) {
          const disassociateResponse = await fetch(`/api/orders/${savedOrderId}/disassociate-invoice/${invoiceId}`, {
            method: 'POST'
          });
          
          if (!disassociateResponse.ok) {
            console.error(`Error al desasociar factura ${invoiceId}`);
          }
        }
        
        if (invoicesToAssociate.length > 0 || invoicesToDisassociate.length > 0) {
          toast.info('Se actualizaron las facturas asociadas al pedido');
        }
      }
      
      // Redirigir a la lista de pedidos
      navigate('/orders');
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error procesando el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner-border"></div>;

  return (
    <div>
      <h2>{isEditing ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Selección de cliente */}
        <div className="mb-3">
          <label htmlFor="customer" className="form-label">Cliente</label>
          <select
            className="form-select"
            id="customer"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un cliente</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.firstName} {customer.lastName} ({customer.phone})
              </option>
            ))}
          </select>
        </div>
        
        {/* Items del pedido */}
        <div className="mb-3">
          <label className="form-label">Productos</label>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formData.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="row mb-2 align-items-center"
                        >
                          <div className="col-md-5">
                            <select
                              className="form-select"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                              required
                            >
                              <option value="">Seleccione un producto</option>
                              {products.map(product => (
                                <option key={product._id} value={product._id}>
                                  {product.name} (${product.price})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-3">
                            <div className="input-group">
                              <span className="input-group-text">Cant.</span>
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="input-group">
                              <span className="input-group-text">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                required
                                readOnly
                              />
                            </div>
                          </div>
                          <div className="col-md-1">
                            <button 
                              type="button" 
                              className="btn btn-danger btn-sm"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <button 
            type="button" 
            className="btn btn-secondary btn-sm mt-2"
            onClick={addItem}
          >
            Agregar Producto
          </button>
        </div>
        
        {/* Total */}
        <div className="mb-3">
          <div className="row">
            <div className="col-md-6 offset-md-6">
              <h4 className="text-end">Total: ${calculateTotal()}</h4>
            </div>
          </div>
        </div>
        
        {/* Tipo de entrega */}
        <div className="mb-3">
          <label className="form-label">Tipo de Entrega</label>
          <div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="deliveryType"
                id="delivery-store"
                value="store"
                checked={formData.deliveryType === 'store'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="delivery-store">
                Retiro en tienda
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="deliveryType"
                id="delivery-home"
                value="home"
                checked={formData.deliveryType === 'home'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="delivery-home">
                Entrega a domicilio
              </label>
            </div>
          </div>
        </div>
        
        {/* Dirección de entrega (solo si es entrega a domicilio) */}
        {formData.deliveryType === 'home' && (
          <div className="mb-3">
            <label htmlFor="deliveryAddress" className="form-label">Dirección de Entrega</label>
            <textarea
              className="form-control"
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              rows="2"
              required
            ></textarea>
          </div>
        )}
        
        {/* Fecha de entrega */}
        <div className="mb-3">
          <label htmlFor="deliveryDate" className="form-label">Fecha de Entrega</label>
          <input
            type="date"
            className="form-control"
            id="deliveryDate"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
          />
        </div>
        
        {/* Estado del pedido (solo para edición) */}
        {isEditing && (
          <div className="mb-3">
            <label htmlFor="status" className="form-label">Estado</label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        )}
        
        {/* Sección de facturas abiertas (solo si hay un cliente seleccionado) */}
        {formData.customer && (
          <div className="mb-4 mt-4">
            <h4>Facturas abiertas del cliente</h4>
            {openInvoices.length === 0 ? (
              <div className="alert alert-info">
                Este cliente no tiene facturas abiertas disponibles para asociar
              </div>
            ) : (
              <div className="row">
                {openInvoices.map(invoice => (
                  <div key={invoice._id} className="col-md-6 mb-2">
                    <div 
                      className={`card p-2 ${selectedInvoices.includes(invoice._id) ? 'border-primary' : ''}`}
                      onClick={() => handleInvoiceSelection(invoice._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold">
                            {invoice.invoiceType} {invoice.invoiceNumber || ''}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(invoice.issueDate).toLocaleDateString()} - 
                            ${invoice.total?.toFixed(2) || '0.00'}
                          </small>
                        </div>
                        <div>
                          {selectedInvoices.includes(invoice._id) ? (
                            <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                          ) : (
                            <i className="bi bi-circle text-secondary fs-4"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-muted small mt-2">
              <i className="bi bi-info-circle"></i> Haga clic en una factura para asociarla a este pedido. 
              Las facturas seleccionadas se usarán para facturar los productos de este pedido.
            </div>
          </div>
        )}
        
        <div className="d-grid gap-2 mt-4">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Pedido' : 'Crear Pedido')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary ms-2" 
            onClick={() => navigate('/orders')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderFormPage;
