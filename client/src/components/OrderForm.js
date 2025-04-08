import React, { useState, useEffect } from 'react';

const OrderForm = ({ initialData = {}, onSave }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer: initialData.customer || '',
    items: initialData.items || [],
    deliveryType: initialData.deliveryType || 'store',
    deliveryAddress: initialData.deliveryAddress || ''
  });

  useEffect(() => {
    // Cargar clientes y productos
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products')
        ]);
        setCustomers(await custRes.json());
        setProducts(await prodRes.json());
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);

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
        ? `/api/orders/${initialData._id}` 
        : '/api/orders';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const savedOrder = await response.json();
      onSave(savedOrder);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{initialData._id ? 'Editar' : 'Nuevo'} Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Cliente</label>
          <select 
            className="form-select" 
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar cliente</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.firstName} {c.lastName} - {c.phone}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Tipo de entrega</label>
          <select 
            className="form-select" 
            name="deliveryType"
            value={formData.deliveryType}
            onChange={handleChange}
            required
          >
            <option value="store">Recoger en tienda</option>
            <option value="home">Entrega a domicilio</option>
          </select>
        </div>
        
        {formData.deliveryType === 'home' && (
          <div className="mb-3">
            <label className="form-label">Dirección de entrega</label>
            <textarea 
              className="form-control" 
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              required
            />
          </div>
        )}
        
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
