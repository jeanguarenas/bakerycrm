import React, { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const ProductsPage = () => {
  const [refresh, setRefresh] = useState(false);

  const handleSave = () => {
    setRefresh(prev => !prev); // Forzar refresco de lista
  };

  return (
    <div className="container">
      <h1>Gestión de Productos</h1>
      <div className="row">
        <div className="col-md-6">
          <ProductForm onSave={handleSave} />
        </div>
        <div className="col-md-6">
          <ProductList refresh={refresh} />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
