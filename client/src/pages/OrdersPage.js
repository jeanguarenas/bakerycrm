import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OrderList from '../components/OrderList';

const OrdersPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(prev => !prev); // Forzar refresco de lista
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Pedidos</h1>
        <Link to="/orders/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Pedido
        </Link>
      </div>
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <OrderList refresh={refresh} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
