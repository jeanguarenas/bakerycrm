import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProductList = ({ refresh }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleDelete = async (e, productId) => {
    e.preventDefault();
    
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar el producto: ${response.status}`);
      }
      
      // Eliminar el producto de la lista local
      setProducts(products.filter(product => product._id !== productId));
      setError(null); // Limpiar cualquier error previo
    } catch (err) {
      setError(`Error al eliminar producto: ${err.message}`);
      console.error('Error eliminando producto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refresh]);

  if (loading) return <div className="spinner-border"></div>;

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mt-4">
        <h3>Lista de Productos</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Link 
                      to={`/products/edit/${product._id}`} 
                      className="btn btn-warning"
                    >
                      Editar
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(e, product._id)} 
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
    </>
  );
};

export default ProductList;
