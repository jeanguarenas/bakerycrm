import React from 'react';
import { FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

const InvoiceDashboard = ({ invoices }) => {
  // Calcular estadísticas
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pendiente').length;
  const completedInvoices = invoices.filter(invoice => invoice.status === 'emitida').length;
  const rejectedInvoices = invoices.filter(invoice => invoice.status === 'rechazada').length;
  
  return (
    <div className="row mb-3">
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card facturacion-card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Total Comprobantes</h6>
                <h3 className="mb-0">{totalInvoices}</h3>
              </div>
              <FaFileInvoiceDollar size={24} className="text-primary opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card facturacion-card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Facturación Total</h6>
                <h3 className="mb-0">${totalAmount.toFixed(2)}</h3>
              </div>
              <FaMoneyBillWave size={24} className="text-success opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card facturacion-card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Comprobantes Emitidos</h6>
                <h3 className="mb-0">{completedInvoices}</h3>
              </div>
              <FaCheckCircle size={24} className="text-success opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6 mb-3 mb-md-0">
        <div className="card facturacion-card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Pendientes</h6>
                <h3 className="mb-0">{pendingInvoices}</h3>
              </div>
              <FaExclamationTriangle size={24} className="text-warning opacity-50" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md col-sm-6">
        <div className="card facturacion-card compact-card h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted mb-1">Rechazados</h6>
                <h3 className="mb-0">{rejectedInvoices}</h3>
              </div>
              <FaTimesCircle size={24} className="text-danger opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDashboard;
