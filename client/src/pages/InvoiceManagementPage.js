import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Componente para la gestión de pedidos y facturación usando un tablero Kanban

const InvoiceManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el kanban
  const [columns, setColumns] = useState({
    remito: {
      id: 'remito',
      title: 'Remito',
      items: []
    },
    factura_pendiente: {
      id: 'factura_pendiente',
      title: 'Factura Pendiente',
      items: []
    },
    factura_cobrada: {
      id: 'factura_cobrada',
      title: 'Factura Cobrada',
      items: []
    },
    pedido_completo: {
      id: 'pedido_completo',
      title: 'Pedido Completo',
      items: []
    }
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Error al cargar los pedidos');
        }
        
        const data = await response.json();
        
        // Inicializar nuevo objeto de columnas para evitar referencias al estado actual
        const newColumns = {
          remito: {
            id: 'remito',
            title: 'Remito',
            items: []
          },
          factura_pendiente: {
            id: 'factura_pendiente',
            title: 'Factura Pendiente',
            items: []
          },
          factura_cobrada: {
            id: 'factura_cobrada',
            title: 'Factura Cobrada',
            items: []
          },
          pedido_completo: {
            id: 'pedido_completo',
            title: 'Pedido Completo',
            items: []
          }
        };
        
        // Distribuir los pedidos en las columnas según su estado de facturación
        data.forEach(order => {
          const column = order.invoiceStatus || 'remito';
          if (newColumns[column]) {
            newColumns[column].items.push(order);
          }
        });
        
        setColumns(newColumns);
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const onDragEnd = async (result) => {
    // Si no hay destino válido, no hacer nada
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Si el origen y destino son iguales, no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Obtener columnas de origen y destino
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Si es la misma columna, reordenar
    if (source.droppableId === destination.droppableId) {
      const newItems = Array.from(sourceColumn.items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);

      const newColumn = {
        ...sourceColumn,
        items: newItems
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn
      });
    } else {
      // Si son columnas diferentes, mover entre ellas
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      const [movedItem] = sourceItems.splice(source.index, 1);
      
      // Actualizar el estado del pedido en el objeto antes de añadirlo
      movedItem.invoiceStatus = destination.droppableId;
      
      destItems.splice(destination.index, 0, movedItem);

      const newSourceColumn = {
        ...sourceColumn,
        items: sourceItems
      };

      const newDestColumn = {
        ...destColumn,
        items: destItems
      };

      setColumns({
        ...columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestColumn.id]: newDestColumn
      });

      // Actualizar en la base de datos
      try {
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
          throw new Error('Error al actualizar el estado de facturación');
        }
      } catch (err) {
        setError(err.message);
        // Revertir cambios en caso de error
        setColumns({
          ...columns
        });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getCustomerName = async (customerId) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        return 'Cliente desconocido';
      }
      const customer = await response.json();
      return customer.name;
    } catch (err) {
      return 'Cliente desconocido';
    }
  };

  if (loading) return <div className="spinner-border" role="status"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Pedidos y Facturación</h2>
        <Link to="/orders/new" className="btn btn-primary">Nuevo Pedido</Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board d-flex overflow-auto">
          {Object.values(columns).map(column => (
            <div className="kanban-column mx-2" key={column.id} style={{ minWidth: '300px' }}>
              <h5 className="p-2 bg-light border">{column.title}</h5>
              <Droppable droppableId={column.id} isDropDisabled={false}>
                {(provided) => (
                  <div
                    className="kanban-items p-2 border bg-light"
                    style={{ minHeight: '500px' }}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {column.items.map((order, index) => (
                      <Draggable 
                        key={`${column.id}-${order._id}`} 
                        draggableId={order._id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="card mb-2"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="card-body">
                              <h6 className="card-title">
                                Pedido #{order._id.substring(order._id.length - 5)}
                              </h6>
                              <p className="card-text">
                                <strong>Cliente:</strong> {order.customer?.name || (typeof order.customer === 'string' ? 'Cliente ' + order.customer : 'Cliente')}
                              </p>
                              <p className="card-text">
                                <strong>Total:</strong> ${order.total ? order.total.toFixed(2) : '0.00'}
                              </p>
                              <p className="card-text">
                                <strong>Fecha:</strong> {order.createdAt ? formatDate(order.createdAt) : 'Sin fecha'}
                              </p>
                              <div className="d-flex justify-content-between">
                                <span 
                                  className={`badge ${order.status === 'completed' ? 'bg-success' : 
                                    order.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}
                                >
                                  {order.status === 'completed' ? 'Completado' : 
                                    order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                                </span>
                                <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                                  Ver
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
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default InvoiceManagementPage;
