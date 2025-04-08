import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const CustomerDetailPage = () => {
  const { phone } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, ordersRes] = await Promise.all([
          fetch(`/api/customers/${phone}`),
          fetch(`/api/orders?customerPhone=${phone}`)
        ]);
        
        setCustomer(await custRes.json());
        setOrders(await ordersRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [phone]);

  if (loading) return <div className="spinner-border m-5"></div>;
  if (!customer) return <div className="alert alert-danger m-5">Cliente no encontrado</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle del Cliente</h1>
        <Link to="/customers" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Información del Cliente</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Nombre:</strong> {customer.firstName} {customer.lastName}</p>
              <p><strong>Teléfono:</strong> {customer.phone}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Dirección:</strong> {customer.address || 'No registrada'}</p>
              <p><strong>Total Pedidos:</strong> {orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Historial de Pedidos</h5>
        </div>
        <div className="card-body">
          {orders.length === 0 ? (
            <p className="text-muted">Este cliente no tiene pedidos registrados</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>${order.total?.toFixed(2)}</td>
                      <td>{order.deliveryType === 'home' ? 'Domicilio' : 'Recoger'}</td>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
