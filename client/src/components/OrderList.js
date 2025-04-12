import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const OrderList = ({ refresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  if (loading) return <div className="spinner-border"></div>;

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
    <div className="mt-4">
      <h3>Lista de Pedidos</h3>
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
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  {order.customer?.firstName} {order.customer?.lastName}
                </td>
                <td>${order.total?.toFixed(2)}</td>
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
                      Ver
                    </Link>
                    <Link 
                      to={`/orders/edit/${order._id}`} 
                      className="btn btn-warning"
                    >
                      Editar
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(e, order._id)} 
                      className="btn btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default OrderList;
