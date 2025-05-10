import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OrderCard from './OrderCard';

const OrderList = ({ refresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' o 'table'
  
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
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refresh]);

  // Función para refrescar lista de pedidos
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(`Error al cargar pedidos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center my-5"><div className="spinner-border"></div></div>;

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Lista de Pedidos</h3>
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('cards')}
          >
            <i className="bi bi-grid"></i> Tarjetas
          </button>
          <button 
            type="button" 
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('table')}
          >
            <i className="bi bi-table"></i> Tabla
          </button>
        </div>
      </div>

      {/* Vista de Tarjetas */}
      {viewMode === 'cards' && (
        <div className="row">
          {orders.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No hay pedidos disponibles.</div>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="col-md-6 col-lg-4 mb-4">
                <OrderCard order={order} onRefresh={refreshOrders} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista de Tabla */}
      {viewMode === 'table' && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No hay pedidos disponibles.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      {order.customer?.firstName} {order.customer?.lastName}
                    </td>
                    <td>${order.total?.toFixed(2) || '0.00'}</td>
                    <td>
                      {order.deliveryType === 'home' ? 'Domicilio' : 'Recoger'}
                    </td>
                    <td>
                      <span className={`badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                        {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link 
                          to={`/orders/${order._id}`} 
                          className="btn btn-info"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link 
                          to={`/orders/edit/${order._id}`} 
                          className="btn btn-warning"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button 
                          onClick={(e) => handleDelete(e, order._id)} 
                          className="btn btn-danger"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default OrderList;
