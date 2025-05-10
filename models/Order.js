const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  deliveryType: { type: String, enum: ['store', 'home'], default: 'store' },
  deliveryAddress: { type: String },
  deliveryDate: { type: Date },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  
  // Campos para gestión de pedidos y facturación (Kanban)
  invoiceStatus: { 
    type: String, 
    enum: ['remito', 'remito_finalizado', 'factura_pendiente', 'factura_cobrada', 'pedido_completo'], 
    default: 'remito' 
  },
  invoiceNumber: { type: String },
  invoiceDate: { type: Date },
  paymentDate: { type: Date },
  paymentMethod: { type: String, enum: ['efectivo', 'transferencia', 'tarjeta', 'otro'], default: 'efectivo' },
  
  // Relación con facturas
  associatedInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
  
  createdAt: { type: Date, default: Date.now }
});

// Validación para actualizar stock cuando se cambia el estado a completado
OrderSchema.pre('save', async function(next) {
  try {
    // Si se está completando el pedido y antes no estaba completo
    if (this.isModified('status') && this.status === 'completed' && this._previousStatus !== 'completed') {
      const Product = mongoose.model('Product');
      
      // Actualizar el stock de cada producto
      for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }
    
    // Guardar estado previo para futuras validaciones
    if (this.isModified('status')) {
      this._previousStatus = this.status;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);
