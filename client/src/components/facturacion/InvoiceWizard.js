import React, { useState } from 'react';
import { FaInfoCircle, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';

// Componente para el indicador de pasos
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`step-item ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > index ? <FaCheck size={12} /> : index + 1}
          </div>
          <div className="step-title">{step.title}</div>
        </div>
      ))}
    </div>
  );
};

// Componente para el Paso 1: Selección de cliente/pedido
const Step1 = ({ 
  availableOrders, 
  selectedOrder, 
  onOrderSelect, 
  onNext 
}) => {
  return (
    <div className="wizard-step active">
      <h5 className="mb-3">Selección de pedido</h5>
      
      <div className="form-group mb-3">
        <label className="form-label d-flex align-items-center">
          Pedido a facturar
          <span className="info-tooltip-icon" title="Seleccione un pedido para generar su factura electrónica">
            <FaInfoCircle />
          </span>
        </label>
        
        <select 
          className="form-select"
          value={selectedOrder}
          onChange={onOrderSelect}
          required
        >
          <option value="">Seleccionar un pedido...</option>
          {availableOrders.map(order => (
            <option key={order._id} value={order._id}>
              Pedido #{order._id.substring(order._id.length - 5)} - ${order.total} - {order.customer?.name || 'Cliente'}
            </option>
          ))}
        </select>
        
        <div className="form-text">
          Solo se muestran pedidos listos para facturar.
        </div>
      </div>
      
      <div className="afip-info-card primary p-3 mb-3">
        <h6 className="mb-2">¿No encuentra el pedido?</h6>
        <p className="mb-0 small">Verifique que el pedido tenga estado "Pedido Completo" o "Remito Finalizado".</p>
      </div>
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={() => {/* Cancelar */}}
        >
          Cancelar
        </button>
        
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={onNext}
          disabled={!selectedOrder}
        >
          Continuar <FaChevronRight className="ms-1" />
        </button>
      </div>
    </div>
  );
};

// Componente para el Paso 2: Datos fiscales
const Step2 = ({ 
  invoiceData, 
  setInvoiceData, 
  onPrev, 
  onNext 
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="wizard-step active">
      <h5 className="mb-3">Datos fiscales</h5>
      
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label className="form-label d-flex align-items-center">
              Tipo de Comprobante
              <span className="info-tooltip-icon" title="Seleccione el tipo de comprobante según la condición fiscal del cliente">
                <FaInfoCircle />
              </span>
            </label>
            <select 
              className="form-select"
              name="invoiceType"
              value={invoiceData.invoiceType}
              onChange={handleInputChange}
              required
            >
              <option value="A">Factura A (Resp. Inscripto)</option>
              <option value="B">Factura B (Consumidor Final)</option>
              <option value="C">Factura C (Monotributista)</option>
              <option value="M">Factura M (Sujetos exceptuados)</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label className="form-label d-flex align-items-center">
              Punto de Venta
              <span className="info-tooltip-icon" title="Punto de venta registrado en AFIP">
                <FaInfoCircle />
              </span>
            </label>
            <input 
              type="text" 
              className="form-control"
              name="pointOfSale"
              value={invoiceData.pointOfSale}
              onChange={handleInputChange}
              placeholder="0001"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="form-group mb-3">
        <label className="form-label d-flex align-items-center">
          Nombre o Razón Social
          <span className="info-tooltip-icon" title="Nombre completo según inscripción en AFIP">
            <FaInfoCircle />
          </span>
        </label>
        <input 
          type="text" 
          className="form-control"
          name="customerName"
          value={invoiceData.customerName}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Tipo de Documento</label>
            <select 
              className="form-select"
              name="documentType"
              value={invoiceData.documentType}
              onChange={handleInputChange}
            >
              <option value="CUIT">CUIT</option>
              <option value="DNI">DNI</option>
              <option value="CUIL">CUIL</option>
              <option value="CE">CE</option>
            </select>
          </div>
        </div>
        <div className="col-md-8">
          <div className="form-group">
            <label className="form-label">Número de Documento</label>
            <input 
              type="text" 
              className="form-control"
              name="documentNumber"
              value={invoiceData.documentNumber}
              onChange={handleInputChange}
              placeholder="Sin guiones ni puntos"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="row mb-3">
        <div className="col-md-8">
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input 
              type="text" 
              className="form-control"
              name="address"
              value={invoiceData.address}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Forma de Pago</label>
            <select 
              className="form-select"
              name="paymentMethod"
              value={invoiceData.paymentMethod}
              onChange={handleInputChange}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="cheque">Cheque</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="afip-info-card warning p-3 mb-3">
        <h6 className="mb-2">Importante</h6>
        <p className="mb-0 small">Para facturas tipo A es obligatorio ingresar un CUIT válido. Para facturas tipo B a consumidores finales por montos menores a $10.000 puede usar DNI sin datos personales.</p>
      </div>
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={onPrev}
        >
          <FaChevronLeft className="me-1" /> Anterior
        </button>
        
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={onNext}
          disabled={!invoiceData.customerName || !invoiceData.documentNumber}
        >
          Continuar <FaChevronRight className="ms-1" />
        </button>
      </div>
    </div>
  );
};

// Componente para el Paso 3: Revisión y emisión
const Step3 = ({ 
  invoiceData, 
  onPrev, 
  onSubmit 
}) => {
  return (
    <div className="wizard-step active">
      <h5 className="mb-3">Revisión y emisión</h5>
      
      <div className="card mb-3">
        <div className="card-header bg-light">
          <h6 className="mb-0">Datos del comprobante</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <p className="mb-1"><strong>Tipo:</strong> Factura {invoiceData.invoiceType}</p>
              <p className="mb-1"><strong>Punto de venta:</strong> {invoiceData.pointOfSale}</p>
              <p className="mb-0"><strong>Forma de pago:</strong> {invoiceData.paymentMethod}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1"><strong>Cliente:</strong> {invoiceData.customerName}</p>
              <p className="mb-1"><strong>{invoiceData.documentType}:</strong> {invoiceData.documentNumber}</p>
              <p className="mb-0"><strong>Dirección:</strong> {invoiceData.address || 'No especificada'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mb-3">
        <div className="card-header bg-light">
          <h6 className="mb-0">Detalle de productos</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-sm compact-table mb-0">
            <thead className="table-light">
              <tr>
                <th>Descripción</th>
                <th className="text-center">Cant.</th>
                <th className="text-end">Precio Unit.</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">IVA</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">${item.unitPrice}</td>
                  <td className="text-end">${item.subtotal}</td>
                  <td className="text-end">${item.iva}</td>
                  <td className="text-end">${item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <th colSpan="3" className="text-end">Totales:</th>
                <th className="text-end">${invoiceData.subtotal}</th>
                <th className="text-end">${invoiceData.iva21}</th>
                <th className="text-end">${invoiceData.total}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <div className="afip-info-card danger p-3 mb-3">
        <h6 className="mb-2">Atención</h6>
        <p className="mb-0 small">Una vez emitido, el comprobante no podrá modificarse. En caso de error deberá emitir una nota de crédito. Verifique todos los datos antes de continuar.</p>
      </div>
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={onPrev}
        >
          <FaChevronLeft className="me-1" /> Anterior
        </button>
        
        <button 
          type="button" 
          className="btn btn-success"
          onClick={onSubmit}
        >
          <FaCheck className="me-1" /> Emitir Comprobante
        </button>
      </div>
    </div>
  );
};

// Componente principal del wizard
const InvoiceWizard = ({ 
  invoiceData, 
  setInvoiceData, 
  availableOrders, 
  selectedOrder, 
  setSelectedOrder, 
  onOrderSelect, 
  onClose, 
  onSubmit 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Definición de pasos
  const steps = [
    { title: 'Selección' },
    { title: 'Datos fiscales' },
    { title: 'Revisión' }
  ];
  
  // Funciones para navegar entre pasos
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="invoice-wizard">
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      {currentStep === 0 && (
        <Step1 
          availableOrders={availableOrders}
          selectedOrder={selectedOrder}
          onOrderSelect={onOrderSelect}
          onNext={goToNextStep}
        />
      )}
      
      {currentStep === 1 && (
        <Step2 
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
          onPrev={goToPrevStep}
          onNext={goToNextStep}
        />
      )}
      
      {currentStep === 2 && (
        <Step3 
          invoiceData={invoiceData}
          onPrev={goToPrevStep}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default InvoiceWizard;
