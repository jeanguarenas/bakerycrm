import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CustomerFormPage = () => {
  const { phone } = useParams();
  const navigate = useNavigate();
  const isEditing = !!phone;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si estamos editando, obtener los datos del cliente
    if (isEditing) {
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${phone}`);
          if (!response.ok) {
            throw new Error('No se pudo obtener los datos del cliente');
          }
          const data = await response.json();
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address || ''
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCustomer();
    }
  }, [phone, isEditing]);

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
        ? `/api/customers/${phone}` 
        : '/api/customers';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar el cliente');
      }
      
      // Redirigir a la lista de clientes
      navigate('/customers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner-border"></div>;

  return (
    <div>
      <h2>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Apellido</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isEditing} // No permitir cambiar el teléfono si estamos editando
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Dirección</label>
          <textarea
            className="form-control"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary ms-2" 
          onClick={() => navigate('/customers')}
          disabled={loading}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default CustomerFormPage;
