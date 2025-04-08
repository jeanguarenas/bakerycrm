import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const CustomerList = ({ refresh }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [refresh]);

  const handleSearch = (searchTerm) => {
    const filtered = customers.filter(customer => 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  };

  if (loading) return <div className="spinner-border"></div>;

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Lista de Clientes</h3>
        <Link to="/customers/new" className="btn btn-primary">
          Nuevo Cliente
        </Link>
      </div>
      
      <SearchBar 
        onSearch={handleSearch} 
        placeholder="Buscar por nombre o teléfono"
      />
      
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer._id}>
                <td>
                  <Link 
                    to={`/customers/${customer.phone}`}
                    className="text-decoration-none"
                  >
                    {customer.firstName} {customer.lastName}
                  </Link>
                </td>
                <td>{customer.phone}</td>
                <td>{customer.address || '-'}</td>
                <td>
                  <Link 
                    to={`/customers/${customer.phone}`} 
                    className="btn btn-sm btn-info"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="alert alert-info">No se encontraron clientes</div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
