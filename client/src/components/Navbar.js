import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Bakery CRM</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/customers">Clientes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/orders">Pedidos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inventory">Inventario</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/invoice-management">Gestión de Pedidos y Facturación</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
