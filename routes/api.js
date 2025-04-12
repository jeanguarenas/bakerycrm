const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Ruta para probar la API
router.get('/test', (req, res) => {
  res.json({ message: 'Bakery CRM API working' });
});

// CRUD para Clientes
router.post('/customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customers/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/customers/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { phone: req.params.phone },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD para Productos
router.post('/products', async (req, res) => {
  try {
    console.log('POST /products - Creating product with data:', req.body);
    
    // Validación explícita de datos
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (req.body.price === undefined || isNaN(parseFloat(req.body.price))) {
      return res.status(400).json({ error: 'Valid product price is required' });
    }
    
    const productData = {
      name: req.body.name.trim(),
      price: parseFloat(req.body.price)
    };
    
    const product = new Product(productData);
    await product.save();
    console.log('Product created successfully:', product);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A product with that name already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    console.log('GET /products - Fetching all products');
    const products = await Product.find().lean();
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    console.log(`GET /products/${req.params.id} - Fetching product by ID`);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid product ID format: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product found:', product);
    res.json(product);
  } catch (err) {
    console.error(`Error fetching product ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    console.log(`PUT /products/${req.params.id} - Updating product with data:`, req.body);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid product ID format: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Validación explícita de datos
    if (req.body.name !== undefined && req.body.name.trim() === '') {
      return res.status(400).json({ error: 'Product name cannot be empty' });
    }
    
    if (req.body.price !== undefined && isNaN(parseFloat(req.body.price))) {
      return res.status(400).json({ error: 'Valid product price is required' });
    }
    
    // Preparar los datos actualizados
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product updated successfully:', product);
    res.json(product);
  } catch (err) {
    console.error(`Error updating product ${req.params.id}:`, err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A product with that name already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un producto
router.delete('/products/:id', async (req, res) => {
  try {
    console.log(`DELETE /products/${req.params.id} - Deleting product`);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid product ID format: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully', deletedProduct });
  } catch (err) {
    console.error(`Error deleting product ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// CRUD para Pedidos
router.post('/orders', async (req, res) => {
  try {
    // Calcular total basado en los productos
    const items = req.body.items;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = new Order({
      ...req.body,
      total
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { customerPhone } = req.query;
    
    let query = {};
    if (customerPhone) {
      const customer = await Customer.findOne({ phone: customerPhone });
      if (customer) {
        query.customer = customer._id;
      }
    }
    
    const orders = await Order.find(query)
      .populate('customer')
      .populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.product');
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    console.log(`PUT /orders/${req.params.id} - Updating order with data:`, req.body);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid order ID format: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    // Primero obtener el pedido existente
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      console.log(`Order not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Preparar los datos para actualización
    let orderData = {};
    
    // Si solo estamos actualizando el estado de facturación
    if (req.body.invoiceStatus && Object.keys(req.body).length === 1) {
      console.log(`Updating only invoice status to: ${req.body.invoiceStatus}`);
      orderData = { invoiceStatus: req.body.invoiceStatus };
    } 
    // Si estamos actualizando items, recalcular el total
    else if (req.body.items) {
      const total = req.body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      orderData = {
        ...req.body,
        total
      };
    }
    // Para otras actualizaciones parciales
    else {
      orderData = req.body;
    }
    
    console.log('Updating order with data:', orderData);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      orderData,
      { new: true, runValidators: true }
    )
    .populate('customer')
    .populate('items.product');
    
    console.log('Order updated successfully');
    res.json(order);
  } catch (err) {
    console.error(`Error updating order ${req.params.id}:`, err);
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un pedido
router.delete('/orders/:id', async (req, res) => {
  try {
    console.log(`DELETE /orders/${req.params.id} - Deleting order`);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid order ID format: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      console.log(`Order not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order deleted successfully');
    res.json({ message: 'Order deleted successfully', deletedOrder });
  } catch (err) {
    console.error(`Error deleting order ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
