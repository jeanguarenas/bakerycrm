const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'unidad' }, // unidad, kg, litros, etc.
  minStock: { type: Number, default: 5 }, // nivel mínimo de stock para alertas
  createdAt: { type: Date, default: Date.now }
});

// Método virtual para saber si el producto está con stock bajo
ProductSchema.virtual('lowStock').get(function() {
  return this.stock <= this.minStock;
});

module.exports = mongoose.model('Product', ProductSchema);
