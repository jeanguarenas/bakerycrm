import React from 'react';
import { 
  FaCubes, 
  FaListAlt,
  FaExclamationTriangle,
  FaBoxOpen,
  FaWarehouse
} from 'react-icons/fa';

const InventoryDashboard = ({ stats }) => {
  return (
    <div className="row mb-3">
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Total Productos</h6>
                <h3 className="mb-0">{stats.totalProducts}</h3>
              </div>
              <FaCubes size={24} className="text-primary opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Categorías</h6>
                <h3 className="mb-0">{stats.totalCategories}</h3>
              </div>
              <FaListAlt size={24} className="text-success opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Stock Bajo</h6>
                <h3 className="mb-0">{stats.lowStock}</h3>
              </div>
              <FaExclamationTriangle size={24} className="text-warning opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Unidades en Stock</h6>
                <h3 className="mb-0">{stats.unitsInStock}</h3>
              </div>
              <FaBoxOpen size={24} className="text-info opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6">
        <div className="card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Valor Total</h6>
                <h3 className="mb-0">${stats.totalValue.toFixed(2)}</h3>
              </div>
              <FaWarehouse size={24} className="text-danger opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
