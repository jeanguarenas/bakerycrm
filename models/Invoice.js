const mongoose = require('mongoose');

// Esquema para los ítems de factura
const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  iva: { type: Number, required: true },
  total: { type: Number, required: true }
});

// Esquema principal de factura
const InvoiceSchema = new mongoose.Schema({
  // Referencias y relaciones
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // Múltiples pedidos/remitos
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  // Datos de factura
  invoiceType: { 
    type: String, 
    enum: ['A', 'B', 'C', 'M', 'NC-A', 'NC-B', 'NC-C', 'ND-A', 'ND-B', 'ND-C'], 
    required: true 
  },
  invoiceNumber: { type: String, required: true },
  pointOfSale: { type: String, required: true, default: '0001' },
  
  // Datos del cliente
  documentType: { 
    type: String, 
    enum: ['CUIT', 'DNI', 'CUIL', 'CE'], 
    required: true 
  },
  documentNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String },
  
  // Detalles económicos
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  iva21: { type: Number, required: true, default: 0 },
  iva10: { type: Number, default: 0 },
  iva27: { type: Number, default: 0 },
  otherTaxes: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Información fiscal
  paymentMethod: { 
    type: String, 
    enum: ['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro'], 
    default: 'efectivo' 
  },
  cae: { type: String },
  caeExpirationDate: { type: Date },
  status: { 
    type: String, 
    enum: ['pendiente', 'emitida', 'rechazada', 'anulada'], 
    default: 'pendiente' 
  },
  
  // Fechas
  issueDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Índices para búsquedas eficientes
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ issueDate: 1 });
InvoiceSchema.index({ status: 1 });

// Método para generar el número de comprobante
InvoiceSchema.methods.generateInvoiceNumber = function(lastNumber) {
  const number = lastNumber ? parseInt(lastNumber) + 1 : 1;
  return `${this.pointOfSale.padStart(4, '0')}-${number.toString().padStart(8, '0')}`;
};

module.exports = mongoose.model('Invoice', InvoiceSchema);
