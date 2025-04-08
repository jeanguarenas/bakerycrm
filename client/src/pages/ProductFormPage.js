import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si estamos editando, obtener los datos del producto
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) {
            throw new Error('No se pudo obtener los datos del producto');
          }
          const data = await response.json();
          setFormData({
            name: data.name,
            price: data.price
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = isEditing 
        ? `/api/products/${id}` 
        : '/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Asegurarse de que el precio es un número
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar el producto');
      }
      
      // Redirigir a la lista de productos
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner-border"></div>;

  return (
    <div>
      <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre del Producto</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="price" className="form-label">Precio</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary ms-2" 
          onClick={() => navigate('/products')}
          disabled={loading}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default ProductFormPage;
