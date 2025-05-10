import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [processingInvoices, setProcessingInvoices] = useState(false);

  // Función para cargar facturas disponibles para este cliente
  const fetchAvailableInvoices = async () => {
    if (!order || !order.customer || !order.customer._id) {
      toast.error('No se pudo determinar el cliente de este pedido');
      return;
    }

    try {
      setProcessingInvoices(true);
      const response = await fetch(`/api/invoices/open-by-customer/${order.customer._id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener facturas disponibles');
      }
      
      const data = await response.json();
      
      // Obtener las facturas ya asociadas al pedido
      const currentInvoices = order.associatedInvoices || [];
      const currentInvoiceIds = currentInvoices.map(inv => 
        typeof inv === 'object' ? inv._id : inv
      );
      
      setAvailableInvoices(data);
      setSelectedInvoices(currentInvoiceIds);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar facturas disponibles');
    } finally {
      setProcessingInvoices(false);
    }
  };

  // Manejar la apertura del modal de facturas
  const handleOpenInvoiceModal = async () => {
    await fetchAvailableInvoices();
    setShowInvoiceModal(true);
  };

  // Manejar la selección/deselección de facturas
  const handleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  // Guardar las asociaciones de facturas
  const handleSaveInvoices = async () => {
    try {
      setProcessingInvoices(true);
      
      // Obtener las facturas actuales
      const currentInvoices = order.associatedInvoices || [];
      const currentInvoiceIds = currentInvoices.map(inv => 
        typeof inv === 'object' ? inv._id : inv
      );
      
      // Determinar facturas a asociar (las nuevas)
      const invoicesToAssociate = selectedInvoices.filter(
        invId => !currentInvoiceIds.includes(invId)
      );
      
      // Determinar facturas a desasociar (las que estaban antes pero ya no)
      const invoicesToDisassociate = currentInvoiceIds.filter(
        invId => !selectedInvoices.includes(invId)
      );
      
      // Asociar nuevas facturas
      for (const invoiceId of invoicesToAssociate) {
        const response = await fetch(`/api/orders/${order._id}/associate-invoice/${invoiceId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Error al asociar factura ${invoiceId}`);
        }
      }
      
      // Desasociar facturas removidas
      for (const invoiceId of invoicesToDisassociate) {
        const response = await fetch(`/api/orders/${order._id}/disassociate-invoice/${invoiceId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Error al desasociar factura ${invoiceId}`);
        }
      }
      
      // Cerrar modal y actualizar
      setShowInvoiceModal(false);
      toast.success('Facturas actualizadas correctamente');
      
      // Refrescar los datos del pedido
      fetchOrder();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessingInvoices(false);
    }
  };

  // Función para cargar el pedido
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error al cargar los datos del pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <div className="spinner-border m-5"></div>;
  if (!order) return <div className="alert alert-danger m-5">Pedido no encontrado</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle del Pedido</h1>
        <div>
          <button 
            className="btn btn-primary me-2" 
            onClick={handleOpenInvoiceModal}
            disabled={processingInvoices}
          >
            <i className="bi bi-file-earmark-text me-1"></i>
            {processingInvoices ? 'Procesando...' : 'Asociar Facturas'}
          </button>
          <Link to="/orders" className="btn btn-secondary">
            Volver
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Información Básica</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Cliente:</strong> {order.customer?.firstName} {order.customer?.lastName}</p>
              <p><strong>Teléfono:</strong> {order.customer?.phone}</p>
              {/* Estado de facturación */}
              <p>
                <strong>Estado de facturación:</strong> 
                <span className={`badge ${order.invoiceStatus === 'factura_cobrada' ? 'bg-success' : 
                  order.invoiceStatus === 'factura_pendiente' ? 'bg-primary' : 'bg-warning'}`}>
                  {order.invoiceStatus === 'remito' ? 'Remito' : 
                   order.invoiceStatus === 'remito_finalizado' ? 'Remito Finalizado' :
                   order.invoiceStatus === 'factura_pendiente' ? 'Factura Pendiente' :
                   order.invoiceStatus === 'factura_cobrada' ? 'Factura Cobrada' : 
                   order.invoiceStatus === 'pedido_completo' ? 'Pedido Completo' : 'Pendiente'}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>
                <strong>Estado:</strong> 
                <span className={`badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                  {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                </span>
              </p>
              <p>
                <strong>Total:</strong> ${order.total?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Facturas Asociadas */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Facturas Asociadas</h5>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleOpenInvoiceModal}
            disabled={processingInvoices}
          >
            <i className="bi bi-file-earmark-text me-1"></i>
            {processingInvoices ? 'Procesando...' : 'Asociar Facturas'}
          </button>
        </div>
        <div className="card-body">
          {order.associatedInvoices && order.associatedInvoices.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>N° Factura</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {order.associatedInvoices.map(invoice => (
                    <tr key={typeof invoice === 'object' ? invoice._id : invoice}>
                      <td>
                        {typeof invoice === 'object' ? invoice.invoiceNumber : `Factura ${invoice.slice(-5)}`}
                      </td>
                      <td>
                        {typeof invoice === 'object' ? invoice.invoiceType || '-' : '-'}
                      </td>
                      <td>
                        {typeof invoice === 'object' ? new Date(invoice.issueDate).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        {typeof invoice === 'object' ? `$${invoice.total?.toFixed(2) || '0.00'}` : '-'}
                      </td>
                      <td>
                        <span className={`badge ${
                          typeof invoice === 'object' ? 
                            (invoice.status === 'pendiente' ? 'bg-warning' : 
                             invoice.status === 'pagada' ? 'bg-success' : 'bg-info') : 'bg-secondary'
                        }`}>
                          {typeof invoice === 'object' ? invoice.status || 'Sin estado' : 'Desconocido'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info mb-0">
              Este pedido no tiene facturas asociadas. 
              <button 
                className="btn btn-link p-0 ms-2" 
                onClick={handleOpenInvoiceModal}
                disabled={processingInvoices}
              >
                Asociar facturas ahora
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Productos</h5>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product?.name || 'Producto eliminado'}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price?.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td>${order.total?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {order.deliveryType === 'home' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Información de Entrega</h5>
          </div>
          <div className="card-body">
            <p><strong>Dirección:</strong> {order.deliveryAddress}</p>
            {order.deliveryDate && (
              <p><strong>Fecha de entrega:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Modal para asociar facturas */}
      {showInvoiceModal && (
        <>
          {/* Modal principal */}
          <div 
            className="modal fade show" 
            style={{ display: 'block' }} 
            tabIndex="-1"
            onClick={(e) => {
              // Cerrar el modal si se hace clic fuera del contenido
              if (e.target.classList.contains('modal')) {
                !processingInvoices && setShowInvoiceModal(false);
              }
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Asociar Facturas al Pedido</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowInvoiceModal(false)}
                    disabled={processingInvoices}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <div className="modal-body">
                  {processingInvoices ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-2">Procesando solicitud...</p>
                    </div>
                  ) : (
                    <>
                      {availableInvoices.length === 0 ? (
                        <div className="alert alert-info">
                          Este cliente no tiene facturas abiertas disponibles para asociar
                        </div>
                      ) : (
                        <div className="row">
                          {availableInvoices.map(invoice => (
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
                      {availableInvoices.length > 0 && (
                        <div className="text-muted small mt-3">
                          <i className="bi bi-info-circle me-1"></i> 
                          Haga clic en una factura para seleccionarla o deseleccionarla. 
                          Las facturas seleccionadas quedarán asociadas a este pedido.
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowInvoiceModal(false)}
                    disabled={processingInvoices}
                  >
                    {availableInvoices.length === 0 ? 'Volver' : 'Cancelar'}
                  </button>
                  {availableInvoices.length > 0 && (
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleSaveInvoices}
                      disabled={processingInvoices}
                    >
                      {processingInvoices ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Backdrop personalizado que permite clics para cerrar */}
          <div 
            className="modal-backdrop fade show" 
            onClick={() => !processingInvoices && setShowInvoiceModal(false)}
            style={{ cursor: processingInvoices ? 'wait' : 'pointer' }}
          ></div>
          
          {/* ESC key handler */}
          {document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && showInvoiceModal && !processingInvoices) {
              setShowInvoiceModal(false);
            }
          })}
        </>
      )}
    </div>
  );
};

export default OrderDetailPage;
