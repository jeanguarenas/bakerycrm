import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="spinner-border m-5"></div>;
  if (!order) return <div className="alert alert-danger m-5">Pedido no encontrado</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle del Pedido</h1>
        <Link to="/orders" className="btn btn-secondary">
          Volver
        </Link>
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
            </div>
            <div className="col-md-6">
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>
                <strong>Estado:</strong> 
                <span className={`badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                  {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                </span>
              </p>
            </div>
          </div>
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
              <p><strong>Fecha entrega:</strong> {new Date(order.deliveryDate).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
