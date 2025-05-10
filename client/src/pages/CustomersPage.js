import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown,
  FaChartBar,
  FaUsers,
  FaUserTie,
  FaShoppingBag,
  FaCalendarAlt
} from 'react-icons/fa';
import CustomerList from '../components/CustomerList';

const CustomersPage = () => {
  // Estados para la página
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Estadísticas para el dashboard
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    activeCustomers: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  
  // Cargar clientes al montar el componente
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/customers');
        
        if (!response.ok) {
          throw new Error('Error al cargar los clientes');
        }
        
        const data = await response.json();
        setCustomers(data);
        
        // Calcular estadísticas
        if(data.length > 0) {
          // Supongamos que cada cliente tiene propiedades como createdAt y orders
          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          
          const newThisMonth = data.filter(customer => {
            const createdAt = new Date(customer.createdAt || Date.now());
            return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear;
          }).length;
          
          const totalOrders = data.reduce((sum, customer) => sum + (customer.orders?.length || 0), 0);
          const activeCustomers = data.filter(customer => customer.orders?.length > 0).length;
          const averageOrderValue = totalOrders > 0 ? 
            data.reduce((sum, customer) => {
              return sum + (customer.orders?.reduce((s, order) => s + (order.total || 0), 0) || 0);
            }, 0) / totalOrders : 0;
          
          setStats({
            totalCustomers: data.length,
            newThisMonth,
            activeCustomers,
            totalOrders,
            averageOrderValue
          });
        }
      } catch (err) {
        setError(err.message);
        // Datos de muestra en caso de error
        setCustomers([
          { 
            _id: 'c1', 
            name: 'Panadería El Molino', 
            documentNumber: '30-12345678-9', 
            type: 'empresa',
            address: 'Av. Rivadavia 1234, CABA',
            createdAt: new Date(2024, 2, 15)
          },
          { 
            _id: 'c2', 
            name: 'María González', 
            documentNumber: '27-98765432-1', 
            type: 'particular',
            address: 'Callao 567, CABA',
            createdAt: new Date(2024, 3, 5)
          },
          { 
            _id: 'c3', 
            name: 'Hotel Buenos Aires', 
            documentNumber: '30-56789012-3', 
            type: 'empresa',
            address: 'San Martín 890, CABA',
            createdAt: new Date(2023, 11, 10)
          }
        ]);
        
        // Estadísticas de muestra
        setStats({
          totalCustomers: 3,
          newThisMonth: 2,
          activeCustomers: 2,
          totalOrders: 12,
          averageOrderValue: 2500
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Filtrar clientes según búsqueda y filtros
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      // Filtro por búsqueda
      const matchesSearch = 
        !searchTerm || 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.documentNumber?.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por tipo de cliente
      const matchesType = 
        customerTypeFilter === 'all' ||
        customer.type === customerTypeFilter;
      
      return matchesSearch && matchesType;
    });
  };
  
  // Ordenar clientes
  const getSortedCustomers = (customers) => {
    return [...customers].sort((a, b) => {
      if(sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if(sortBy === 'recent') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Más recientes primero
      } else if(sortBy === 'orders') {
        return (b.orders?.length || 0) - (a.orders?.length || 0);
      }
      return 0;
    });
  };
  
  const filteredCustomers = getFilteredCustomers();
  const sortedCustomers = getSortedCustomers(filteredCustomers);
  
  return (
    <div className="customers-container">
      {/* Encabezado y acciones principales */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Clientes</h2>
          <p className="text-muted small mb-0">Gestión de clientes y empresas</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary compact-card btn-sm"
            onClick={() => setFilterActive(!filterActive)}
          >
            <FaFilter className="me-1" /> Filtros
          </button>
          <Link 
            to="/customers/new" 
            className="btn btn-primary compact-card btn-sm"
          >
            <FaPlus className="me-1" /> Nuevo Cliente
          </Link>
        </div>
      </div>
      
      {/* Panel de estadísticas */}
      <div className="row mb-3">
        <div className="col-md col-sm-6 mb-3 mb-md-0">
          <div className="card compact-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Clientes</h6>
                  <h3 className="mb-0">{stats.totalCustomers}</h3>
                </div>
                <FaUsers size={24} className="text-primary opacity-50" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md col-sm-6 mb-3 mb-md-0">
          <div className="card compact-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Nuevos este mes</h6>
                  <h3 className="mb-0">{stats.newThisMonth}</h3>
                </div>
                <FaUserTie size={24} className="text-success opacity-50" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md col-sm-6 mb-3 mb-md-0">
          <div className="card compact-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Clientes Activos</h6>
                  <h3 className="mb-0">{stats.activeCustomers}</h3>
                </div>
                <FaUser size={24} className="text-info opacity-50" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md col-sm-6 mb-3 mb-md-0">
          <div className="card compact-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Pedidos</h6>
                  <h3 className="mb-0">{stats.totalOrders}</h3>
                </div>
                <FaShoppingBag size={24} className="text-warning opacity-50" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md col-sm-6">
          <div className="card compact-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Promedio Pedido</h6>
                  <h3 className="mb-0">${stats.averageOrderValue.toFixed(2)}</h3>
                </div>
                <FaChartBar size={24} className="text-danger opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtros activos */}
      {filterActive && (
        <div className="filter-bar mb-3">
          <div className="row g-2">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <FaSearch size={12} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar por nombre, CUIT o dirección"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="empresa">Empresas</option>
                <option value="particular">Particulares</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Ordenar por nombre</option>
                <option value="recent">Más recientes</option>
                <option value="orders">Mayor cantidad de pedidos</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setCustomerTypeFilter('all');
                  setSortBy('name');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabla compacta de clientes */}
      <div className="card compact-card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando datos de clientes...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">
              {error}
            </div>
          ) : sortedCustomers.length === 0 ? (
            <div className="text-center p-4">
              <p className="mb-2">No se encontraron clientes con los filtros aplicados.</p>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setCustomerTypeFilter('all');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover compact-table mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>CUIT/DNI</th>
                    <th>Dirección</th>
                    <th>Tipo</th>
                    <th>Fecha de alta</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCustomers.map(customer => (
                    <tr key={customer._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="customer-avatar me-2 bg-primary rounded-circle text-white d-flex justify-content-center align-items-center" style={{width: '30px', height: '30px'}}>
                            {(customer.firstName || customer.lastName) ? (customer.firstName?.charAt(0) || customer.lastName?.charAt(0)) : 'C'}
                          </div>
                          <div>
                            <div className="fw-medium">{`${customer.firstName || ''} ${customer.lastName || ''}`}</div>
                            <div className="small text-muted">
                              {customer.phone || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{customer.documentNumber || '-'}</td>
                      <td>{customer.address || '-'}</td>
                      <td>
                        <span className={`badge bg-${customer.type === 'empresa' ? 'primary' : 'secondary'}`}>
                          {customer.type === 'empresa' ? 'Empresa' : 'Particular'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt size={12} className="text-muted me-1" />
                          {customer.createdAt 
                            ? new Date(customer.createdAt).toLocaleDateString('es-AR') 
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="text-end">
                        <Link 
                          to={`/customers/${customer._id}`}
                          className="btn btn-sm btn-outline-primary me-1"
                        >
                          Ver
                        </Link>
                        <Link 
                          to={`/customers/${customer._id}/edit`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
