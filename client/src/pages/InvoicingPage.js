import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileInvoiceDollar, 
  FaSync, 
  FaPrint, 
  FaFileDownload, 
  FaCheckCircle, 
  FaTimesCircle,
  FaFilter,
  FaInfoCircle,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaDownload
} from 'react-icons/fa';

// Importar estilos y componentes
import '../styles/facturacion.css';
import InvoiceWizard from '../components/facturacion/InvoiceWizard';
import QuickActions from '../components/facturacion/QuickActions';
import ToastNotification from '../components/facturacion/ToastNotification';
import InvoiceTableCompact from '../components/facturacion/InvoiceTableCompact';
import InvoiceDashboard from '../components/facturacion/InvoiceDashboard';

const InvoicingPage = () => {
  // Estados principales
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el sistema de pestañas
  const [activeTab, setActiveTab] = useState('emitidos');
  
  // Estados para filtros
  const [filterActive, setFilterActive] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el wizard de facturación
  const [showWizard, setShowWizard] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [wizardStep, setWizardStep] = useState(0);
  
  // Estado para notificaciones toast
  const [toasts, setToasts] = useState([]);
  
  // Datos para la facturación
  const [invoiceData, setInvoiceData] = useState({
    invoiceType: 'A', // A, B, C, etc.
    invoiceNumber: '',
    documentType: 'CUIT',
    documentNumber: '',
    customerName: '',
    address: '',
    items: [],
    subtotal: 0,
    iva21: 0,
    iva10: 0,
    total: 0,
    paymentMethod: 'efectivo',
    pointOfSale: '0001',
    cae: '',
    caeExpirationDate: '',
    status: 'pendiente' // pendiente, emitida, rechazada, anulada
  });
  
  // Función para añadir notificaciones toast
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);
  
  // Función para eliminar notificaciones toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Fetch de facturas existentes
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        
        // Mostrar el skeleton loader durante la carga
        const skeletonTimer = setTimeout(() => {
          // Esta API tendría que implementarse para devolver los datos de facturación
          setLoading(false); // En caso de que la API tarde demasiado, mostramos skeleton
        }, 1000);
        
        // Esta API tendría que implementarse para devolver los datos de facturación
        const response = await fetch('/api/invoices');
        
        clearTimeout(skeletonTimer);
        
        if (!response.ok) {
          throw new Error('Error al cargar las facturas');
        }
        
        const data = await response.json();
        setInvoices(data);
        
        // Notificar que se cargaron los datos correctamente
        if (data.length > 0) {
          addToast(`Se cargaron ${data.length} comprobantes`, 'success');
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.message);
        addToast(`Error: ${err.message}`, 'error');
        
        // Datos de ejemplo en caso de error (para desarrollo)
        setInvoices([
          {
            _id: 'inv1',
            invoiceType: 'A',
            invoiceNumber: '0001-00000001',
            customerName: 'Cliente Ejemplo S.A.',
            documentNumber: '30712345678',
            total: 12100.50,
            status: 'emitida',
            issueDate: new Date(),
            cae: '71234567890123'
          },
          {
            _id: 'inv2',
            invoiceType: 'B',
            invoiceNumber: '0001-00000002',
            customerName: 'Consumidor Final',
            documentNumber: '20334455667',
            total: 5445.30,
            status: 'pendiente',
            issueDate: new Date(),
            cae: ''
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [addToast]); // Agregamos addToast como dependencia

  // Fetch de órdenes disponibles para facturación
  useEffect(() => {
    const fetchAvailableOrders = async () => {
      try {
        console.log('Intentando cargar pedidos disponibles...');
        
        // Intentar la ruta principal primero
        let response = await fetch('/api/orders/for-invoice');
        
        // Si falla, intentar la ruta alternativa
        if (!response.ok) {
          console.log('La ruta principal falló, intentando ruta alternativa...');
          response = await fetch('/api/orders-simple');
          
          if (!response.ok) {
            throw new Error('Error al cargar pedidos disponibles');
          }
        }
        
        const data = await response.json();
        console.log('Pedidos cargados:', data.length);
        
        // Si no hay pedidos pero estamos en modo de desarrollo, crear datos de ejemplo
        if (data.length === 0) {
          console.log('No hay pedidos disponibles, usando datos de ejemplo');
          // Datos de ejemplo para pruebas
          setAvailableOrders([
            {
              _id: 'ejemplo1',
              customer: { name: 'Cliente de Ejemplo', documentNumber: '20334455667' },
              total: 1500,
              items: [
                { product: { name: 'Pan Francés' }, quantity: 10, price: 150 }
              ]
            },
            {
              _id: 'ejemplo2',
              customer: { name: 'Empresa S.A.', documentNumber: '30712345678' },
              total: 2500,
              items: [
                { product: { name: 'Facturas Mixtas' }, quantity: 25, price: 100 }
              ]
            }
          ]);
          addToast('Usando datos de ejemplo para pedidos', 'info');
        } else {
          setAvailableOrders(data);
          addToast(`${data.length} pedidos disponibles para facturar`, 'success');
        }
      } catch (err) {
        console.error('Error fetching available orders:', err);
        addToast(`Error al cargar pedidos: ${err.message}`, 'error');
        
        // En caso de error, mostrar datos de ejemplo
        setAvailableOrders([
          {
            _id: 'ejemplo1',
            customer: { name: 'Cliente de Ejemplo (Modo Fallback)', documentNumber: '20334455667' },
            total: 1500,
            items: [
              { product: { name: 'Pan Francés' }, quantity: 10, price: 150 }
            ]
          }
        ]);
      }
    };

    if (showWizard) {
      fetchAvailableOrders();
    }
  }, [showWizard, addToast]); // Actualizamos las dependencias

  // Función para cargar datos de un pedido seleccionado
  const handleOrderSelect = async (e) => {
    const orderId = e.target.value;
    setSelectedOrder(orderId);
    
    if (!orderId) {
      return;
    }
    
    try {
      // Mostrar notificación de carga
      const loadingToastId = addToast('Cargando datos del pedido...', 'info');
      
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Error al cargar detalles del pedido');
      }
      
      const orderData = await response.json();
      
      // Quitar notificación de carga
      removeToast(loadingToastId);
      
      // Calcular IVA y totales (21% estándar en Argentina)
      const subtotal = orderData.total / 1.21; // Extraer el subtotal sin IVA
      const iva21 = subtotal * 0.21; // Calcular el IVA
      
      setInvoiceData({
        ...invoiceData,
        customer: orderData.customer?._id, // Guardar el ID del cliente
        customerName: orderData.customer?.firstName + ' ' + orderData.customer?.lastName || 'Cliente',
        documentNumber: orderData.customer?.documentNumber || '',
        address: orderData.customer?.address || '',
        items: orderData.items.map(item => ({
          description: item.product?.name || 'Producto',
          quantity: item.quantity,
          unitPrice: (item.price / 1.21).toFixed(2), // Precio sin IVA
          subtotal: ((item.price / 1.21) * item.quantity).toFixed(2), // Subtotal sin IVA
          iva: ((item.price / 1.21) * 0.21 * item.quantity).toFixed(2), // IVA del item
          total: (item.price * item.quantity).toFixed(2) // Total con IVA
        })),
        subtotal: subtotal.toFixed(2),
        iva21: iva21.toFixed(2),
        total: orderData.total.toFixed(2)
      });
      
      // Avanzar al siguiente paso automáticamente
      setWizardStep(1);
      
      // Notificar éxito
      addToast('Datos del pedido cargados correctamente', 'success');
    } catch (err) {
      console.error('Error loading order details:', err);
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  // Función para generar la factura
  const generateInvoice = async () => {
    try {
      // Verificar que tengamos un cliente seleccionado
      if (!invoiceData.customer) {
        addToast('Error: Se requiere seleccionar un cliente para la factura', 'error');
        return;
      }

      const processingToastId = addToast('Procesando solicitud en AFIP...', 'info');
      
      // Preparar datos para enviar a la API
      const invoiceToCreate = {
        ...invoiceData,
        order: selectedOrder, // Incluir referencia al pedido seleccionado
        status: 'pendiente'
      };
      
      console.log('Datos de factura a crear:', invoiceToCreate);
      
      // Simulación de procesamiento AFIP (para dar sensación de espera real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enviar los datos a nuestra API (que simulará la interacción con AFIP)
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceToCreate)
      });
      
      // Eliminar notificación de procesamiento
      removeToast(processingToastId);
      
      if (!response.ok) {
        throw new Error('Error al generar la factura');
      }
      
      const savedInvoice = await response.json();
      
      // Actualizar la lista de facturas localmente
      setInvoices([...invoices, savedInvoice]);
      
      // Resetear el formulario
      setShowWizard(false);
      setSelectedOrder('');
      setWizardStep(0);
      setInvoiceData({
        invoiceType: 'A',
        invoiceNumber: '',
        documentType: 'CUIT',
        documentNumber: '',
        customerName: '',
        address: '',
        items: [],
        subtotal: 0,
        iva21: 0,
        iva10: 0,
        total: 0,
        paymentMethod: 'efectivo',
        pointOfSale: '0001',
        cae: '',
        caeExpirationDate: '',
        status: 'pendiente'
      });
      
      // Recargar la lista de facturas
      const refreshResponse = await fetch('/api/invoices');
      if (refreshResponse.ok) {
        const updatedInvoices = await refreshResponse.json();
        setInvoices(updatedInvoices);
      }
      
      // Notificar éxito
      addToast('Factura generada correctamente con CAE: ' + savedInvoice.cae, 'success');
    } catch (err) {
      console.error('Error generating invoice:', err);
      addToast(`Error al generar la factura: ${err.message}`, 'error');
    }
  };
  
  // Función para filtrar facturas según búsqueda y filtros
  const getFilteredInvoices = () => {
    return invoices.filter(invoice => {
      // Filtro por búsqueda
      const matchesSearch = 
        !searchTerm || 
        invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber?.includes(searchTerm) ||
        invoice.documentNumber?.includes(searchTerm);
      
      // Filtro por estado
      const matchesStatus = 
        statusFilter === 'all' ||
        invoice.status === statusFilter;
      
      // Filtro por fecha
      const invoiceDate = new Date(invoice.issueDate);
      const today = new Date();
      const isToday = 
        invoiceDate.getDate() === today.getDate() &&
        invoiceDate.getMonth() === today.getMonth() &&
        invoiceDate.getFullYear() === today.getFullYear();
      
      const isThisWeek = () => {
        const weekStart = new Date();
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return invoiceDate >= weekStart && invoiceDate <= weekEnd;
      };
      
      const isThisMonth = 
        invoiceDate.getMonth() === today.getMonth() &&
        invoiceDate.getFullYear() === today.getFullYear();
      
      const matchesDate = 
        dateFilter === 'all' ||
        (dateFilter === 'today' && isToday) ||
        (dateFilter === 'week' && isThisWeek()) ||
        (dateFilter === 'month' && isThisMonth);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };
  
  // Para propósitos de ordenamiento
  const getSortedInvoices = (invoices) => {
    return [...invoices].sort((a, b) => {
      const dateA = new Date(a.issueDate || 0);
      const dateB = new Date(b.issueDate || 0);
      return dateB - dateA; // Orden descendente (más reciente primero)
    });
  };

  // Filtrar y ordenar facturas
  const filteredInvoices = getFilteredInvoices();
  const sortedInvoices = getSortedInvoices(filteredInvoices);
  
  // Renderizado
  return (
    <div className="facturacion-container">
      {/* Notificaciones Toast */}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      
      {/* Encabezado y acciones principales */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Facturación AFIP</h2>
          <p className="text-muted small mb-0">Gestión de comprobantes electrónicos</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary compact-card btn-sm"
            onClick={() => setFilterActive(!filterActive)}
          >
            <FaFilter className="me-1" /> Filtros
          </button>
          <button 
            className="btn btn-primary compact-card btn-sm" 
            onClick={() => setShowWizard(true)}
          >
            <FaFileInvoiceDollar className="me-1" /> Nueva Factura
          </button>
        </div>
      </div>
      
      {/* Dashboard con estadísticas */}
      {!showWizard && (
        <div className="row">
          <div className="col-md-9">
            {/* Panel de estadísticas */}
            <div className="mb-3">
              {/* Importamos el componente de dashboard */}
              <InvoiceDashboard invoices={invoices} />
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
                        placeholder="Buscar por cliente, número o CUIT"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white">
                        <FaCalendarAlt size={12} />
                      </span>
                      <select 
                        className="form-select form-select-sm"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      >
                        <option value="all">Todas las fechas</option>
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Todos los estados</option>
                      <option value="emitida">Emitidas</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="rechazada">Rechazadas</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button 
                      className="btn btn-sm btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm('');
                        setDateFilter('all');
                        setStatusFilter('all');
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            )
            }
            
            {/* Sistema de pestañas para comprobantes */}
            <div className="card compact-card">
              <div className="card-header p-0 bg-white">
                <ul className="nav nav-tabs compact-tabs card-header-tabs">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'emitidos' ? 'active' : ''}`}
                      onClick={() => setActiveTab('emitidos')}
                    >
                      Emitidos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'pendientes' ? 'active' : ''}`}
                      onClick={() => setActiveTab('pendientes')}
                    >
                      Pendientes
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'rechazados' ? 'active' : ''}`}
                      onClick={() => setActiveTab('rechazados')}
                    >
                      Rechazados
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body p-0">
                {/* Tabla de comprobantes compacta*/}
                <InvoiceTableCompact 
                  invoices={sortedInvoices}
                  loading={loading}
                  error={error}
                  activeTab={activeTab}
                />
              </div>
            </div>
          </div>
          
          {/* Barra lateral de acciones rápidas */}
          <div className="col-md-3">
            <QuickActions />
            
            <div className="afip-info-card primary p-3 mt-3">
              <h6 className="mb-2">Vencimientos AFIP</h6>
              <p className="small mb-1">
                <strong>IVA:</strong> 18/04/2025
              </p>
              <p className="small mb-1">
                <strong>Ganancias:</strong> 28/04/2025
              </p>
              <p className="small mb-0">
                <strong>IIBB:</strong> 15/04/2025
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Wizard de nueva factura */}
      {showWizard && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Nueva Factura Electrónica</h5>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => {
                setShowWizard(false);
                setWizardStep(0);
              }}
            >
              Cancelar
            </button>
          </div>
          <div className="card-body">
            {/* Componente wizard con pasos */}
            <InvoiceWizard 
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              availableOrders={availableOrders}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              onOrderSelect={handleOrderSelect}
              onClose={() => {
                setShowWizard(false);
                setWizardStep(0);
              }}
              onSubmit={generateInvoice}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicingPage;
