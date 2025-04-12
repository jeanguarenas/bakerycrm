import React from 'react';
import { Link } from 'react-router-dom';
import { FaTag, FaSort } from 'react-icons/fa';

// Componente para mostrar la tabla de inventario con diseño compacto
const InventoryTable = ({ 
  products, 
  loading, 
  error,
  onSortChange,
  onStockUpdate
}) => {
  // Determinar la clase CSS según el nivel de stock
  const getStockStatusClass = (product) => {
    if ((product.stock || 0) <= 0) return 'table-danger';
    if ((product.stock || 0) < 10) return 'table-warning';
    return '';
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando datos de inventario...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger m-3">
        {error}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="mb-2">No se encontraron productos con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover compact-table mb-0">
        <thead className="table-light">
          <tr>
            <th>
              <div className="d-flex align-items-center">
                Producto
                <button 
                  className="btn btn-sm btn-light ms-1 p-0 border-0" 
                  onClick={() => onSortChange('name')}
                >
                  <FaSort size={10} />
                </button>
              </div>
            </th>
            <th>Categoría</th>
            <th>
              <div className="d-flex align-items-center">
                Precio
                <div className="ms-1">
                  <button 
                    className="btn btn-sm btn-light p-0 border-0 d-block mb-1" 
                    onClick={() => onSortChange('price_asc')}
                  >
                    <FaSort size={10} />
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                Stock
                <div className="ms-1">
                  <button 
                    className="btn btn-sm btn-light p-0 border-0 d-block mb-1" 
                    onClick={() => onSortChange('stock_desc')}
                  >
                    <FaSort size={10} />
                  </button>
                </div>
              </div>
            </th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id} className={getStockStatusClass(product)}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="product-icon me-2 rounded d-flex justify-content-center align-items-center" 
                       style={{width: '36px', height: '36px', backgroundColor: '#f8f9fa'}}>
                    <FaTag className="text-primary" />
                  </div>
                  <div>
                    <div className="fw-medium">{product.name}</div>
                    <div className="small text-muted">
                      {product.description?.substring(0, 30) || 'Sin descripción'}
                      {product.description?.length > 30 ? '...' : ''}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge bg-light text-dark">
                  {product.category || 'Sin categoría'}
                </span>
              </td>
              <td>
                <span className="fw-medium">${(product.price || 0).toFixed(2)}</span>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <input 
                    type="number" 
                    min="0" 
                    className="form-control form-control-sm me-2" 
                    style={{ width: '60px' }} 
                    value={product.stock || 0}
                    onChange={(e) => onStockUpdate(product._id, parseInt(e.target.value) || 0)}
                  />
                  <small className="text-muted">{product.unit || 'u.'}</small>
                </div>
              </td>
              <td className="text-end">
                <div className="d-flex justify-content-end">
                  <Link 
                    to={`/products/${product._id}`}
                    className="btn btn-sm btn-outline-primary me-1"
                  >
                    Ver
                  </Link>
                  <Link 
                    to={`/products/${product._id}/edit`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Editar
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
