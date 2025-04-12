import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingBag, FaBreadSlice, FaClipboardList, FaFileInvoiceDollar, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  // Colores personalizados para el dashboard (paleta cálida para panadería)
  const colors = {
    customers: '#E28A31',    // Naranja cálido
    orders: '#C64639',       // Rojo tostado
    products: '#6A803D',     // Verde oliva
    inventory: '#9C5046',    // Marrón hornear
    invoices: '#4D7090',     // Azul tranquilo
    analytics: '#8F607A'     // Púrpura suave
  };

  // Datos para las tarjetas del dashboard
  const dashboardItems = [
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: <FaUsers size={32} />,
      color: colors.customers,
      path: '/customers',
      count: '124'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Administración de pedidos',
      icon: <FaShoppingBag size={32} />,
      color: colors.orders,
      path: '/orders',
      count: '37'
    },
    {
      id: 'products',
      title: 'Productos',
      description: 'Catálogo de productos',
      icon: <FaBreadSlice size={32} />,
      color: colors.products,
      path: '/products',
      count: '42'
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Control de stock e ingredientes',
      icon: <FaClipboardList size={32} />,
      color: colors.inventory,
      path: '/inventory',
      count: '215'
    },
    {
      id: 'invoices',
      title: 'Facturación',
      description: 'Gestión de pedidos y facturación',
      icon: <FaFileInvoiceDollar size={32} />,
      color: colors.invoices,
      path: '/invoice-management',
      count: '85'
    },
    {
      id: 'analytics',
      title: 'Análisis',
      description: 'Reportes y estadísticas',
      icon: <FaChartLine size={32} />,
      color: colors.analytics,
      path: '/analytics',
      count: ''
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panadería Don Carlos - Sistema de Gestión</h1>
        <p className="dashboard-subtitle">Seleccione un módulo para comenzar</p>
      </div>

      <div className="dashboard-grid">
        {dashboardItems.map(item => (
          <Link 
            to={item.path} 
            key={item.id} 
            className="dashboard-card"
            style={{ 
              backgroundColor: item.color, 
              borderColor: item.color
            }}
          >
            <div className="dashboard-card-content">
              <div className="dashboard-card-icon">
                {item.icon}
              </div>
              <div className="dashboard-card-info">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
            {item.count && (
              <div className="dashboard-card-count">
                <span>{item.count}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
