import React, { useState } from 'react';

const CustomerForm = ({ initialData = {}, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    phone: initialData.phone || '',
    address: initialData.address || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = initialData._id ? 'PUT' : 'POST';
      const url = initialData._id 
        ? `/api/customers/${initialData.phone}` 
        : '/api/customers';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const savedCustomer = await response.json();
      onSave(savedCustomer);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{initialData._id ? 'Editar' : 'Nuevo'} Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input 
            type="text" 
            className="form-control" 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Apellido</label>
          <input 
            type="text" 
            className="form-control" 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input 
            type="text" 
            className="form-control" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={!!initialData._id}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <textarea 
            className="form-control" 
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
