import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileInvoiceDollar, 
  FaPrint, 
  FaDownload, 
  FaTable, 
  FaChartBar, 
  FaCogs, 
  FaRegCalendarAlt
} from 'react-icons/fa';

const QuickActions = () => {
  return (
    <div className="quick-actions card compact-card sticky-top">
      <div className="card-header bg-light">
        <h6 className="mb-0">Acciones rápidas</h6>
      </div>
      <div className="card-body p-2">
        <Link to="#" className="action-button d-flex align-items-center mb-2">
          <FaFileInvoiceDollar className="me-2 text-primary" /> 
          <span>Nueva factura</span>
        </Link>
        
        <Link to="#" className="action-button d-flex align-items-center mb-2">
          <FaPrint className="me-2 text-secondary" /> 
          <span>Imprimir último</span>
        </Link>
        
        <Link to="#" className="action-button d-flex align-items-center mb-2">
          <FaDownload className="me-2 text-success" /> 
          <span>Descargar libro IVA</span>
        </Link>
        
        <Link to="#" className="action-button d-flex align-items-center mb-2">
          <FaTable className="me-2 text-info" /> 
          <span>Reporte AFIP</span>
        </Link>
        
        <Link to="#" className="action-button d-flex align-items-center mb-2">
          <FaChartBar className="me-2 text-warning" /> 
          <span>Estadísticas</span>
        </Link>
        
        <Link to="#" className="action-button d-flex align-items-center mb-2">
          <FaRegCalendarAlt className="me-2 text-danger" /> 
          <span>Vencimientos</span>
        </Link>
        
        <Link to="#" className="action-button d-flex align-items-center">
          <FaCogs className="me-2 text-secondary" /> 
          <span>Configuración AFIP</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
