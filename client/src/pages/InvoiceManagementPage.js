import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';

// Componente para la gestión de pedidos y facturación usando un tablero Kanban
const InvoiceManagementPage = () => {
  // Estilo global para evitar problemas de scroll anidados
  React.useEffect(() => {
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
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el kanban - Estructura simplificada para mayor estabilidad
  const [columns, setColumns] = useState({
    remito: {
      id: 'remito',
      title: 'Remito',
      items: []
    },
    remito_finalizado: {
      id: 'remito_finalizado',
      title: 'Remitos Finalizados',
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
  
  // Arreglo estable de IDs de columnas para asegurar que nunca cambie el orden
  const columnOrder = ['remito', 'remito_finalizado', 'factura_pendiente', 'factura_cobrada', 'pedido_completo'];

  // Función para cargar pedidos (ahora fuera del useEffect para poder reutilizarla)
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Error al cargar los pedidos');
      }
      
      const data = await response.json();
      
      // Creamos un objeto de columnas desde cero en lugar de depender del estado columns actual
      const newColumns = {
        remito: {
          id: 'remito',
          title: 'Remito',
          items: []
        },
        remito_finalizado: {
          id: 'remito_finalizado',
          title: 'Remitos Finalizados',
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
      
      // Distribuir los pedidos en las columnas según su estado
      data.forEach(order => {
        // Verificar que la orden tiene un ID válido antes de procesarla
        if (order && order._id) {
          const columnId = order.invoiceStatus || 'remito';
          
          // Verificar que existe la columna correspondiente
          if (newColumns[columnId]) {
            // Agregar a la columna correspondiente con todas las propiedades necesarias
            newColumns[columnId].items.push({
              ...order,
              id: order._id, // ID explícito para react-beautiful-dnd
              _id: order._id // Asegurar que _id siempre está presente
            });
          }
        } else {
          console.warn('Se encontró una orden sin ID válido:', order);
        }
      });
      
      setColumns(newColumns);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Ya no depende de columns

  // Cargar pedidos al inicio
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Estado local para rastrear si hay una operación de API en curso
  const [isUpdating, setIsUpdating] = useState(false);

  // Manejar el evento de finalización de arrastre
  const onDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    
    // Si no hay destino (se soltó fuera de un droppable), no hacer nada
    if (!destination) {
      return;
    }
    
    // Si el origen y destino son el mismo y el índice es el mismo, no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      // OPTIMIZACIÓN: Usar el operador de propagación en lugar de JSON.parse/stringify 
      // para una copia menos costosa (rendimiento mejorado)
      const newColumns = {};
      
      // Copiar solo las columnas que vamos a modificar
      Object.keys(columns).forEach(key => {
        if (key === source.droppableId || key === destination.droppableId) {
          newColumns[key] = {
            ...columns[key],
            items: [...columns[key].items]
          };
        } else {
          newColumns[key] = columns[key];
        }
      });
      
      // Obtener las columnas de origen y destino
      const sourceColumn = newColumns[source.droppableId];
      const destColumn = newColumns[destination.droppableId];
      
      // Verificaciones de seguridad (abreviadas)
      if (!sourceColumn || !destColumn || 
          !Array.isArray(sourceColumn.items) ||
          source.index < 0 || source.index >= sourceColumn.items.length) {
        toast.error('Error en operación de arrastrar y soltar');
        return;
      }

      // Obtener el pedido que se está moviendo
      const [removedOrder] = sourceColumn.items.splice(source.index, 1);
      
      if (!removedOrder || !removedOrder._id) {
        toast.error('Error: Pedido inválido');
        return;
      }
      
      // OPTIMIZACIÓN CLAVE: Actualizar el estado visual INMEDIATAMENTE
      // para movimientos dentro de la misma columna
      if (source.droppableId === destination.droppableId) {
        // Solo reordenar (sin llamada API)
        sourceColumn.items.splice(destination.index, 0, removedOrder);
        
        // Actualizar el estado UI inmediatamente
        setColumns(newColumns);
        return; // No necesitamos llamada a API para reordenar
      } 
      
      // Si se mueve a otra columna (cambio de estado)
      // Actualizar el estado del pedido localmente
      const updatedOrder = {
        ...removedOrder,
        invoiceStatus: destination.droppableId
      };
      
      // Insertar en la columna de destino
      destColumn.items.splice(destination.index, 0, updatedOrder);
      
      // IMPORTANTE: Actualizar UI ANTES de la llamada API para una experiencia fluida
      setColumns(newColumns);
      
      // Evitar múltiples llamadas API simultáneas
      if (isUpdating) {
        console.warn('Operación API en progreso, esperando...');
        return;
      }
      
      // Marcar que estamos haciendo una actualización API
      setIsUpdating(true);
      
      // Actualizar en la base de datos (en segundo plano)
      try {
        if (!removedOrder._id) {
          throw new Error('ID de pedido inválido');
        }
        
        // Preparamos el cuerpo de la solicitud con el estado de facturación
        const requestBody = {
          invoiceStatus: destination.droppableId
        };
        
        // Al mover a pedido_completo, también se marca como completed
        if (destination.droppableId === 'pedido_completo') {
          // Actualizamos la tarjeta localmente también
          updatedOrder.status = 'completed';
        } else {
          // Si se mueve a otra columna, se marca como pendiente
          updatedOrder.status = 'pending';
        }
        
        const response = await fetch(`/api/orders/${removedOrder._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error al actualizar: ${response.status} - ${errorData}`);
        }
        
        const updatedOrderData = await response.json();
        
        // Actualizar el estado local con los datos recibidos del servidor
        // para reflejar el cambio de estado
        const updatedColumns = JSON.parse(JSON.stringify(newColumns));
        const updatedItem = updatedColumns[destination.droppableId].items.find(
          item => item._id === removedOrder._id
        );
        
        if (updatedItem) {
          updatedItem.status = updatedOrderData.status;
        }
        
        setColumns(updatedColumns);
        toast.success('Pedido actualizado correctamente');
      } catch (error) {
        console.error('Error actualizando pedido:', error);
        toast.error(`Error: ${error.message}`);
        
        // Si hay error, revertir los cambios
        fetchOrders(); // Recargar datos desde el servidor
      } finally {
        // Independientemente del resultado, marcar que terminamos
        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Error en drag and drop:', error);
      toast.error('Error al mover el pedido');
    }
  }, [columns, isUpdating]);

  // Formato de fecha para mostrar en las tarjetas
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) return <div className="spinner-border text-primary" role="status"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h2>Gestión de Pedidos y Facturación</h2>
        <Link to="/orders/new" className="btn btn-primary">Nuevo Pedido</Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board d-flex" style={{ 
          overflowX: 'auto', 
          overflowY: 'hidden', 
          padding: '0',
          width: '100%',
          gap: '0',
          margin: '0'
        }}>
          {columnOrder.map(columnId => {
            const column = columns[columnId];
            return (
              <div 
                className="kanban-column px-1" 
                key={columnId} 
                style={{ 
                  width: '20%',
                  minWidth: '300px',
                  flex: '1 1 20%'
                }}>
                <h5 className="p-2 bg-light border rounded-top text-center fw-bold">{column.title}</h5>
                <Droppable 
                  droppableId={columnId} 
                  type="ORDER" 
                  direction="vertical"
                  isDropDisabled={false}
                >
                  {(provided) => (
                    <div
                      className="kanban-items p-2 border border-top-0 bg-light rounded-bottom"
                      style={{ 
                        minHeight: '500px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: column.items.length > 8 ? 'auto' : 'visible',
                        height: column.items.length > 8 ? 'calc(100vh - 150px)' : 'auto',
                        maxHeight: column.items.length > 8 ? 'calc(100vh - 150px)' : 'none'
                      }}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {column.items.filter(order => order && order._id).map((order, index) => (
                        <Draggable 
                          key={order._id} 
                          draggableId={order._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className="card mb-2 shadow-sm"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                // Aplica los estilos del arrastre, pero con modificaciones
                                ...provided.draggableProps.style,
                                // Fuerza un ancho fijo y evita stretching
                                width: snapshot.isDragging ? '280px' : '100%',
                                height: 'auto',
                                // Mantén los márgenes consistentes
                                margin: '0 0 12px 0',
                                // Estilos visuales mejorados
                                backgroundColor: snapshot.isDragging ? '#e9f5ff' : 'white',
                                cursor: 'grab',
                                border: snapshot.isDragging ? '2px solid #007bff' : '1px solid #dee2e6',
                                boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,123,255,0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
                                borderRadius: '6px',
                                // Desactiva transiciones durante arrastre para mejor rendimiento
                                transition: 'none',
                                // Importante: no sobrescribir el transform que aplica react-beautiful-dnd
                              }}
                            >
                              <div className="card-body">
                                <h6 className="card-title">
                                  Pedido #{order._id.substring(order._id.length - 5)}
                                </h6>
                                <p className="card-text">
                                  <strong>Cliente:</strong> {order.customer?.name || 'Cliente'}
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
                                    title="El estado se sincroniza automáticamente con la columna 'Pedido Completo'"
                                    style={{ cursor: 'help' }}
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
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default InvoiceManagementPage;
