import React, { useState } from 'react';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';

const OrdersPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleSave = () => {
    setRefresh(prev => !prev); // Forzar refresco de lista
  };

  return (
    <div className="container">
      <h1>Gestión de Pedidos</h1>
      <div className="row">
        <div className="col-md-6">
          <OrderForm onSave={handleSave} />
        </div>
        <div className="col-md-6">
          <OrderList refresh={refresh} />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
