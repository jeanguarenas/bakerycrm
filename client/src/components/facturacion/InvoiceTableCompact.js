import React from 'react';
import { Link } from 'react-router-dom';
import { FaPrint, FaFileDownload, FaEye, FaTimesCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Componente para mostrar el estado de una factura con el formato adecuado
const InvoiceStatus = ({ status }) => {
  switch (status) {
    case 'emitida':
      return (
        <span className="invoice-status emitida">
          <FaCheckCircle size={12} className="me-1" /> Emitida
        </span>
      );
    case 'pendiente':
      return (
        <span className="invoice-status pendiente">
          <FaExclamationTriangle size={12} className="me-1" /> Pendiente
        </span>
      );
    case 'rechazada':
      return (
        <span className="invoice-status rechazada">
          <FaTimesCircle size={12} className="me-1" /> Rechazada
        </span>
      );
    case 'anulada':
      return (
        <span className="invoice-status anulada">
          <FaTimesCircle size={12} className="me-1" /> Anulada
        </span>
      );
    default:
      return <span className="invoice-status">{status}</span>;
  }
};

// Mostrar un loader de skeleton mientras carga
const InvoiceTableSkeleton = () => (
  <div className="p-3">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="mb-3">
        <div className="skeleton-line" style={{ width: '100%' }}></div>
        <div className="d-flex mt-2">
          <div className="skeleton-line me-2" style={{ width: '20%' }}></div>
          <div className="skeleton-line me-2" style={{ width: '30%' }}></div>
          <div className="skeleton-line" style={{ width: '15%' }}></div>
        </div>
      </div>
    ))}
  </div>
);

// Tabla compacta de comprobantes
const InvoiceTableCompact = ({ 
  invoices, 
  loading, 
  error,
  activeTab = 'emitidos'
}) => {
  if (loading) return <InvoiceTableSkeleton />;
  
  if (error) return (
    <div className="alert alert-danger m-3">
      {error}
    </div>
  );
  
  if (invoices.length === 0) return (
    <div className="text-center p-4">
      <p className="mb-2">No se encontraron comprobantes.</p>
    </div>
  );

  return (
    <div className="table-responsive">
      <table className="table table-hover compact-table mb-0">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Comprobante</th>
            <th>Cliente</th>
            <th>CUIT/DNI</th>
            <th className="text-end">Total</th>
            <th>CAE</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={invoice._id || index}>
              <td>
                {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('es-AR') : '-'}
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-1">{invoice.invoiceType}</span>
                  {invoice.invoiceNumber}
                </div>
              </td>
              <td>{invoice.customerName}</td>
              <td>
                <small>{invoice.documentType}</small>: {invoice.documentNumber}
              </td>
              <td className="text-end fw-bold">${Number(invoice.total).toFixed(2)}</td>
              <td>
                {invoice.cae ? (
                  <small className="text-truncate d-inline-block" style={{ maxWidth: '120px' }}>
                    {invoice.cae}
                  </small>
                ) : '-'}
              </td>
              <td>
                <InvoiceStatus status={invoice.status} />
              </td>
              <td>
                <div className="d-flex justify-content-end">
                  <Link 
                    to={`#`} 
                    className="btn btn-sm btn-outline-info me-1"
                    title="Ver detalle"
                  >
                    <FaEye size={12} />
                  </Link>
                  <Link 
                    to={`#`} 
                    className="btn btn-sm btn-outline-secondary me-1"
                    title="Imprimir"
                  >
                    <FaPrint size={12} />
                  </Link>
                  <Link 
                    to={`#`} 
                    className="btn btn-sm btn-outline-primary"
                    title="Descargar PDF"
                  >
                    <FaFileDownload size={12} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTableCompact;
