const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Sin categoría' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'unidad' }, // unidad, kg, litros, etc.
  minStock: { type: Number, default: 10 }, // nivel mínimo de stock para alertas
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Método virtual para saber si el producto está con stock bajo
ProductSchema.virtual('lowStock').get(function() {
  return this.stock <= this.minStock;
});

// Middleware para actualizar automáticamente el campo updatedAt
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para actualizar updatedAt en operaciones de actualización
ProductSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
