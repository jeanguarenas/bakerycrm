import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleUpdateStock = async (id, newStock) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      // Actualizar el estado local
      setProducts(products.map(product => 
        product._id === id ? { ...product, stock: newStock } : product
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusClass = (product) => {
    if (product.stock <= 0) return 'table-danger';
    if (product.stock <= product.minStock) return 'table-warning';
    return '';
  };

  if (loading) return <div className="spinner-border" role="status"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventario</h2>
        <Link to="/products/new" className="btn btn-primary">Nuevo Producto</Link>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Unidad</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id} className={getStockStatusClass(product)}>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.unit}</td>
                <td>{product.stock}</td>
                <td>{product.minStock}</td>
                <td>
                  <div className="d-flex">
                    <div className="input-group me-2">
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => handleUpdateStock(product._id, Math.max(0, product.stock - 1))}>
                        -
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center" 
                        style={{width: '60px'}}
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product._id, parseInt(e.target.value) || 0)}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => handleUpdateStock(product._id, product.stock + 1)}>
                        +
                      </button>
                    </div>
                    <Link 
                      to={`/products/edit/${product._id}`} 
                      className="btn btn-sm btn-outline-primary">
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda para colores de stock */}
      <div className="mt-3">
        <div className="d-flex align-items-center mb-2">
          <div className="bg-danger me-2" style={{width: '20px', height: '20px'}}></div>
          <span>Sin stock</span>
        </div>
        <div className="d-flex align-items-center">
          <div className="bg-warning me-2" style={{width: '20px', height: '20px'}}></div>
          <span>Stock bajo (debajo del mínimo establecido)</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
