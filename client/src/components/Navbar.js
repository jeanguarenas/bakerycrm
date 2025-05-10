import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaShoppingBag, FaBreadSlice, FaClipboardList, FaFileInvoice, FaChartLine } from 'react-icons/fa';

export default function Navbar() {
  const location = useLocation();
  
  // Verificar qué ruta está activa
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <FaBreadSlice size={24} className="me-2" />
          WouK CRM
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${isActive('/')}`} to="/">
                <FaHome className="me-2" /> Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${isActive('/customers')}`} to="/customers">
                <FaUsers className="me-2" /> Clientes
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${isActive('/orders')}`} to="/orders">
                <FaShoppingBag className="me-2" /> Pedidos
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${isActive('/products')}`} to="/products">
                <FaBreadSlice className="me-2" /> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${isActive('/inventory')}`} to="/inventory">
                <FaClipboardList className="me-2" /> Inventario
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${isActive('/invoicing')}`} to="/invoicing">
                <FaFileInvoice className="me-2" /> Facturación AFIP
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
