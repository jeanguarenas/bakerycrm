import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const OrderList = ({ refresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <Link 
                    to={`/orders/${order._id}`} 
                    className="btn btn-sm btn-info"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
