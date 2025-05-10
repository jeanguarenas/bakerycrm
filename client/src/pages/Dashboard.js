import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingBag, FaBreadSlice, FaClipboardList, FaFileInvoiceDollar, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  // Estado para los contadores de cada módulo
  const [counters, setCounters] = useState({
    customers: 0,
    orders: 0,
    products: 0,
    inventory: 0,
    invoices: 0,
    analytics: ''
  });

  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  
  // Colores personalizados para el dashboard
  const colors = {
    customers: '#E28A31',    // Naranja cálido
    orders: '#C64639',       // Rojo tostado
    products: '#6A803D',     // Verde oliva
    inventory: '#9C5046',    // Marrón hornear
    invoices: '#4D7090',     // Azul tranquilo
    analytics: '#8F607A'     // Púrpura suave
  };

  // Cargar datos reales al montar el componente
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Obtener conteo de clientes
        const customersRes = await fetch('/api/customers');
        const customersData = await customersRes.json();
        
        // Obtener conteo de productos
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        
        // Obtener conteo de pedidos
        const ordersRes = await fetch('/api/orders');
        const ordersData = await ordersRes.json();
        
        // Obtener conteo de facturas
        const invoicesRes = await fetch('/api/invoices');
        const invoicesData = await invoicesRes.json();
        
        // Actualizar los contadores con datos reales
        setCounters({
          customers: customersData.length || 0,
          orders: ordersData.length || 0,
          products: productsData.length || 0,
          inventory: productsData.filter(p => (p.stock || 0) > 0).length || 0,
          invoices: invoicesData.length || 0,
          analytics: ''
        });
      } catch (error) {
        console.error('Error cargando contadores:', error);
        // En caso de error, usar contadores básicos para que la UI funcione
        setCounters({
          customers: 0,
          orders: 0,
          products: 0,
          inventory: 0,
          invoices: 0,
          analytics: ''
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  // Datos para las tarjetas del dashboard
  const dashboardItems = [
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: <FaUsers size={32} />,
      color: colors.customers,
      path: '/customers',
      count: loading ? '...' : counters.customers.toString()
    },
    {
      id: 'orders',
      title: 'Pedidos',
      description: 'Administración de pedidos y facturación',
      icon: <FaShoppingBag size={32} />,
      color: colors.orders,
      path: '/orders',
      count: loading ? '...' : counters.orders.toString()
    },
    {
      id: 'products',
      title: 'Productos',
      description: 'Catálogo de productos',
      icon: <FaBreadSlice size={32} />,
      color: colors.products,
      path: '/products',
      count: loading ? '...' : counters.products.toString()
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Control de stock e ingredientes',
      icon: <FaClipboardList size={32} />,
      color: colors.inventory,
      path: '/inventory',
      count: loading ? '...' : counters.inventory.toString()
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
        <h1>WouK CRM - Sistema de Gestión</h1>
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
