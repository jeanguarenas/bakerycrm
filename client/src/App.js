import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CustomerFormPage from './pages/CustomerFormPage';
import ProductFormPage from './pages/ProductFormPage';
import OrderFormPage from './pages/OrderFormPage';
import InventoryPage from './pages/InventoryPage';
import InvoiceManagementPage from './pages/InvoiceManagementPage';
import InvoicingPage from './pages/InvoicingPage';

// Importar estilos personalizados
import './styles/Dashboard.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/customers/edit/:phone" element={<CustomerFormPage />} />
          <Route path="/customers/:phone" element={<CustomerDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/edit/:id" element={<ProductFormPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders/edit/:id" element={<OrderFormPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/invoice-management" element={<InvoiceManagementPage />} />
          <Route path="/invoicing" element={<InvoicingPage />} />
          <Route path="/analytics" element={<Dashboard />} /> {/* Placeholder para futura página de análisis */}
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
