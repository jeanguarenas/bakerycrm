import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import OrderCard from './OrderCard';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';

const OrderList = ({ refresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'table' o 'cards'
  
  // Estados para el kanban (gestión de pedidos)
  const [columns, setColumns] = useState({
    remito: {
      id: 'remito',
      title: 'Pool',
      items: []
    },
    factura_pendiente: {
      id: 'factura_pendiente',
      title: 'Pedido en Proceso',
      items: []
    },
    factura_cobrada: {
      id: 'factura_cobrada',
      title: 'Pedido en Hold',
      items: []
    },
    pedido_completo: {
      id: 'pedido_completo',
      title: 'Pedido Completo',
      items: []
    }
  });
  
  // Estilo global para evitar problemas de scroll en modo kanban
  useEffect(() => {
    if (viewMode === 'kanban') {
      const style = document.createElement('style');
      style.textContent = `
        .kanban-items {
          overflow: visible !important;
        }
        .kanban-board {
          min-height: 600px;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [viewMode]);
  
  const handleDelete = async (e, orderId) => {
    e.preventDefault();
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;
    
    try {
      setLoading(true);
      // Usamos la URL relativa para que el proxy la dirija correctamente al backend
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar el pedido: ${response.status}`);
      }
      
      // Eliminar el pedido de la lista local
      setOrders(orders.filter(order => order._id !== orderId));
      setError(null); // Limpiar cualquier error previo
    } catch (err) {
      setError(`Error al eliminar pedido: ${err.message}`);
      console.error('Error eliminando pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
        
        // Organizar pedidos en columnas para el modo kanban
        if (viewMode === 'kanban') {
          organizeOrdersInColumns(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refresh, viewMode]);

  // Función para refrescar lista de pedidos
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
      
      // Organizar pedidos en columnas para el modo kanban
      if (viewMode === 'kanban') {
        organizeOrdersInColumns(data);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(`Error al cargar pedidos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para organizar pedidos en columnas (kanban)
  const organizeOrdersInColumns = (orders) => {
    // Crear nuevo objeto de columnas con items vacíos
    const newColumns = {
      remito: {
        ...columns.remito,
        items: []
      },
      factura_pendiente: {
        ...columns.factura_pendiente,
        items: []
      },
      factura_cobrada: {
        ...columns.factura_cobrada,
        items: []
      },
      pedido_completo: {
        ...columns.pedido_completo,
        items: []
      }
    };
    
    // Distribuir pedidos según su estado de facturación
    orders.forEach(order => {
      // Asegurarse de que el pedido tenga una propiedad invoiceStatus válida
      let status = order.invoiceStatus || 'remito';
      
      // Reasignar los pedidos de 'remito_finalizado' a 'factura_pendiente'
      if (status === 'remito_finalizado') {
        status = 'factura_pendiente';
      }
      
      // Comprobar si la columna existe, y si no, colocarlo en remito
      if (newColumns[status]) {
        newColumns[status].items.push({
          ...order,
          id: order._id // Asegurar que tiene un id único para react-beautiful-dnd
        });
      } else {
        newColumns.remito.items.push({
          ...order,
          id: order._id
        });
      }
    });
    
    setColumns(newColumns);
  };
  
  // Manejar el evento de arrastrar y soltar para el kanban
  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Si no hay cambio de columna, no hacemos nada
    if (source.droppableId === destination.droppableId) return;
    
    // Eliminar el item de la columna de origen
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    
    // Añadir el item a la columna de destino
    destItems.splice(destination.index, 0, removed);
    
    // Actualizar el estado
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems
      }
    });
    
    try {
      // Actualizar el estado de facturación en el backend
      const response = await fetch(`/api/orders/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceStatus: destination.droppableId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar pedido: ${response.status}`);
      }
      
      toast.success(`Pedido movido a ${destColumn.title}`);
      
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al mover el pedido. Se restableció a su posición original.');
      
      // Revertir cambios en la UI
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: [...sourceColumn.items]
        },
        [destination.droppableId]: {
          ...destColumn,
          items: [...destColumn.items]
        }
      });
      
      refreshOrders();
    }
  }, [columns]);

  if (loading) return <div className="d-flex justify-content-center my-5"><div className="spinner-border"></div></div>;

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          {viewMode === 'cards' && 'Tarjetas'}
          {viewMode === 'table' && 'Listado'}
          {viewMode === 'kanban' && 'Kanban'}
        </h3>
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              setViewMode('kanban');
              organizeOrdersInColumns(orders);
            }}
          >
            <i className="bi bi-kanban"></i> Kanban
          </button>
          <button 
            type="button" 
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('table')}
          >
            <i className="bi bi-table"></i> Listado
          </button>
          <button 
            type="button" 
            className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('cards')}
          >
            <i className="bi bi-grid"></i> Tarjetas
          </button>
        </div>
      </div>

      {/* Vista de Tarjetas */}
      {viewMode === 'cards' && (
        <div className="row">
          {orders.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">
                No hay pedidos disponibles. <Link to="/orders/new">Crear un nuevo pedido</Link>
              </div>
            </div>
          ) : (
            orders.map(order => (
              <div className="col-md-6 col-lg-4 mb-4" key={order._id}>
                <OrderCard 
                  order={order} 
                  onDelete={(e) => handleDelete(e, order._id)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista de Tabla */}
      {viewMode === 'table' && (
        <>
          {orders.length === 0 ? (
            <div className="alert alert-info">
              No hay pedidos disponibles. <Link to="/orders/new">Crear un nuevo pedido</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha de Creación</th>
                    <th>Fecha de entrega</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders].sort((a, b) => {
                    // Pedidos completados al final
                    if (a.status === 'completed' && b.status !== 'completed') return 1;
                    if (a.status !== 'completed' && b.status === 'completed') return -1;
                    // Si ambos tienen el mismo estado, ordenar por fecha (más recientes primero)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                  }).map(order => (
                    <tr key={order._id}>
                      <td>
                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Cliente no disponible'}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        {order.promisedDate 
                          ? new Date(order.promisedDate).toLocaleDateString() 
                          : 'No especificada'}
                      </td>
                      <td>${order.total?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                          {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link to={`/orders/${order._id}`} className="btn btn-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link to={`/orders/${order._id}/edit`} className="btn btn-warning">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-danger"
                            onClick={(e) => handleDelete(e, order._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Vista de Kanban (Gestión de Pedidos) */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="row g-3" style={{ alignItems: 'flex-start' }}>
              {Object.values(columns).map(column => (
                <div className="col" key={column.id}>
                  <div className="card">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">{column.title}</h5>
                      <small className="text-muted">{column.items.length} pedidos</small>
                    </div>
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`card-body kanban-items p-2 ${
                            snapshot.isDraggingOver ? 'bg-light' : ''
                          }`}
                          style={{ 
                            minHeight: '300px'
                          }}
                        >
                          {column.items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`card mb-3 ${
                                    snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                  }`}
                                  style={{
                                    backgroundColor: snapshot.isDragging
                                      ? '#f8f9fa'
                                      : '#fff',
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <div className="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0 fw-bold">
                                      {item.customer 
                                        ? `${item.customer.firstName} ${item.customer.lastName}`
                                        : 'Cliente no disponible'
                                      }
                                    </h6>
                                    <span className={`badge ${item.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                      {item.status === 'completed' ? 'Completado' : 'Pendiente'}
                                    </span>
                                  </div>
                                  <div className="card-body p-3">
                                    <div className="mb-3 small">
                                      <div className="row mb-1">
                                        <div className="col-6 text-muted">Fecha creación:</div>
                                        <div className="col-6 text-end">
                                          {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                      
                                      <div className="row mb-1">
                                        <div className="col-6 text-muted">Fecha comprometida:</div>
                                        <div className="col-6 text-end">
                                          {item.promisedDate 
                                            ? new Date(item.promisedDate).toLocaleDateString() 
                                            : 'No especificada'}
                                        </div>
                                      </div>
                                      
                                      <div className="row mb-1">
                                        <div className="col-6 text-muted">Número remito:</div>
                                        <div className="col-6 text-end">
                                          {item._id ? `#${item._id.substring(0, 5)}` : 'Sin número'}
                                        </div>
                                      </div>
                                      
                                      <div className="row mb-1">
                                        <div className="col-6 text-muted">Factura asociada:</div>
                                        <div className="col-6 text-end">
                                          {item.associatedInvoices && item.associatedInvoices.length > 0 
                                            ? <span className="badge bg-info">{typeof item.associatedInvoices[0] === 'string' 
                                                ? item.associatedInvoices[0].substring(0, 8) 
                                                : (item.associatedInvoices[0]._id 
                                                    ? item.associatedInvoices[0]._id.substring(0, 8) 
                                                    : 'ID-' + Math.floor(Math.random() * 1000))}</span>
                                            : 'Sin factura'}
                                        </div>
                                      </div>
                                      
                                      <div className="row">
                                        <div className="col-6 text-muted">Monto pedido:</div>
                                        <div className="col-6 text-end fw-bold">
                                          ${item.total?.toFixed(2) || '0.00'}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-end">
                                      <Link to={`/orders/${item._id}`} className="btn btn-sm btn-primary">
                                        <i className="bi bi-eye me-1"></i>Detalles
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}
    </>
  );
};

export default OrderList;
