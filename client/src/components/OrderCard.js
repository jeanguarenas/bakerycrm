import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderCard = ({ order, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Formatear la fecha en formato legible
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Obtener las facturas disponibles para este cliente
  const fetchAvailableInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/open-by-customer/${order.customer._id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener facturas disponibles');
      }
      
      const data = await response.json();
      
      // Obtener las facturas ya asociadas al pedido
      const currentInvoices = order.associatedInvoices || [];
      const currentInvoiceIds = currentInvoices.map(inv => 
        typeof inv === 'object' ? inv._id : inv
      );
      
      setAvailableInvoices(data);
      setSelectedInvoices(currentInvoiceIds);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar facturas disponibles');
    } finally {
      setLoading(false);
    }
  };

  // Manejar la apertura del modal de facturas
  const handleOpenInvoiceModal = async () => {
    await fetchAvailableInvoices();
    setShowInvoiceModal(true);
  };

  // Manejar la selección/deselección de facturas
  const handleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  // Guardar las asociaciones de facturas
  const handleSaveInvoices = async () => {
    try {
      setLoading(true);
      
      // Obtener las facturas actuales
      const currentInvoices = order.associatedInvoices || [];
      const currentInvoiceIds = currentInvoices.map(inv => 
        typeof inv === 'object' ? inv._id : inv
      );
      
      // Determinar facturas a asociar (las nuevas)
      const invoicesToAssociate = selectedInvoices.filter(
        invId => !currentInvoiceIds.includes(invId)
      );
      
      // Determinar facturas a desasociar (las que estaban antes pero ya no)
      const invoicesToDisassociate = currentInvoiceIds.filter(
        invId => !selectedInvoices.includes(invId)
      );
      
      // Asociar nuevas facturas
      for (const invoiceId of invoicesToAssociate) {
        const response = await fetch(`/api/orders/${order._id}/associate-invoice/${invoiceId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Error al asociar factura ${invoiceId}`);
        }
      }
      
      // Desasociar facturas removidas
      for (const invoiceId of invoicesToDisassociate) {
        const response = await fetch(`/api/orders/${order._id}/disassociate-invoice/${invoiceId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Error al desasociar factura ${invoiceId}`);
        }
      }
      
      // Cerrar modal y actualizar
      setShowInvoiceModal(false);
      toast.success('Facturas actualizadas correctamente');
      
      // Refrescar la lista de pedidos
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener estado de visualización para el pedido
  const getStatusBadge = () => {
    if (order.status === 'completed') {
      return <span className="badge bg-success">Completado</span>;
    } else {
      return <span className="badge bg-warning">Pendiente</span>;
    }
  };

  return (
    <>
      <div className="card mb-3 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Pedido #{order._id.slice(-5)}</h5>
        </div>
        <div className="card-body">
          <div className="mb-2">
            <strong>Cliente:</strong> {order.customer?.firstName} {order.customer?.lastName}
          </div>
          <div className="mb-2">
            <strong>Total:</strong> ${order.total?.toFixed(2)}
          </div>
          <div className="mb-2">
            <strong>Fecha:</strong> {formatDate(order.createdAt)}
          </div>
          <div className="mb-2">
            {getStatusBadge()}
          </div>
          
          {/* Sección de facturas asociadas */}
          <div className="mt-3">
            <h6>Facturas asociadas:</h6>
            {order.associatedInvoices && order.associatedInvoices.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {order.associatedInvoices.map(invoice => (
                  <span key={typeof invoice === 'object' ? invoice._id : invoice} 
                        className="badge bg-info text-dark">
                    {typeof invoice === 'object' 
                      ? `${invoice.invoiceNumber || 'Factura'}`
                      : `Factura ${invoice.slice(-5)}`}
                  </span>
                ))}
              </div>
            ) : (
              <small className="text-muted">Sin facturas asociadas</small>
            )}
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between">
          <div className="btn-group btn-group-sm">
            <Link to={`/orders/${order._id}`} className="btn btn-info">
              <i className="bi bi-eye"></i> Ver
            </Link>
            <Link to={`/orders/edit/${order._id}`} className="btn btn-warning">
              <i className="bi bi-pencil"></i> Editar
            </Link>
          </div>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleOpenInvoiceModal}
            disabled={loading}
          >
            <i className="bi bi-file-earmark-text"></i> {loading ? 'Procesando...' : 'Asociar Facturas'}
          </button>
        </div>
      </div>

      {/* Modal para asociar facturas */}
      {showInvoiceModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Asociar Facturas al Pedido</h5>
                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando facturas disponibles...</p>
                  </div>
                ) : (
                  <>
                    {availableInvoices.length === 0 ? (
                      <div className="alert alert-info">
                        Este cliente no tiene facturas abiertas disponibles para asociar
                      </div>
                    ) : (
                      <div className="row">
                        {availableInvoices.map(invoice => (
                          <div key={invoice._id} className="col-md-6 mb-2">
                            <div 
                              className={`card p-2 ${selectedInvoices.includes(invoice._id) ? 'border-primary' : ''}`}
                              onClick={() => handleInvoiceSelection(invoice._id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <span className="fw-bold">
                                    {invoice.invoiceType} {invoice.invoiceNumber || ''}
                                  </span>
                                  <br />
                                  <small className="text-muted">
                                    {new Date(invoice.issueDate).toLocaleDateString()} - 
                                    ${invoice.total?.toFixed(2) || '0.00'}
                                  </small>
                                </div>
                                <div>
                                  {selectedInvoices.includes(invoice._id) ? (
                                    <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                                  ) : (
                                    <i className="bi bi-circle text-secondary fs-4"></i>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveInvoices}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
