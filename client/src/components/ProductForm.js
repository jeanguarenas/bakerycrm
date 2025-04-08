import React, { useState } from 'react';

const ProductForm = ({ initialData = {}, onSave }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    price: initialData.price || 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = initialData._id ? 'PUT' : 'POST';
      const url = initialData._id 
        ? `/api/products/${initialData._id}` 
        : '/api/products';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const savedProduct = await response.json();
      onSave(savedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{initialData._id ? 'Editar' : 'Nuevo'} Producto</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input 
            type="text" 
            className="form-control" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio</label>
          <input 
            type="number" 
            className="form-control" 
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
