const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

// Ruta para probar la API
router.get('/test', (req, res) => {
  res.json({ message: 'Bakery CRM API working' });
});

// CRUD para Clientes
router.post('/customers', async (req, res) => {
  try {
    console.log('POST /customers - Datos recibidos:', req.body);
    
    // Validación básica
    if (!req.body.firstName || req.body.firstName.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    if (!req.body.lastName || req.body.lastName.trim() === '') {
      return res.status(400).json({ error: 'El apellido es obligatorio' });
    }
    
    if (!req.body.phone || req.body.phone.trim() === '') {
      return res.status(400).json({ error: 'El teléfono es obligatorio' });
    }
    
    // Crear objeto de cliente con validación de campos opcionales
    const customerData = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      phone: req.body.phone.trim(),
      documentNumber: req.body.documentNumber || '',
      address: req.body.address || '',
      type: ['particular', 'empresa'].includes(req.body.type) ? req.body.type : 'particular'
    };
    
    const customer = new Customer(customerData);
    await customer.save();
    
    console.log('Cliente creado exitosamente:', customer);
    res.status(201).json(customer);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    
    // Manejo específico para errores comunes
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un cliente con ese teléfono' });
    }
    
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
      price: parseFloat(req.body.price),
      // Campos opcionales
      description: req.body.description || '',
      category: req.body.category || 'Sin categoría',
      stock: req.body.stock !== undefined ? parseInt(req.body.stock) : 0,
      unit: req.body.unit || 'unidad',
      minStock: req.body.minStock !== undefined ? parseInt(req.body.minStock) : 10
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
    
    // Validar que stock sea un número válido si se proporciona
    if (req.body.stock !== undefined && isNaN(parseInt(req.body.stock))) {
      return res.status(400).json({ error: 'Stock must be a valid number' });
    }
    
    // Preparar los datos actualizados
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
    if (req.body.stock !== undefined) updateData.stock = parseInt(req.body.stock);
    if (req.body.unit !== undefined) updateData.unit = req.body.unit;
    if (req.body.minStock !== undefined) updateData.minStock = parseInt(req.body.minStock);
    
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
      .populate('items.product')
      .populate('associatedInvoices'); // Popular las facturas asociadas
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    console.log(`GET /orders/${req.params.id} - Fetching order by ID`);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid order ID format: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    // Buscar el pedido y popular tanto customer como product dentro de items
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.product')
      .populate('associatedInvoices'); // Popular las facturas asociadas
    
    if (!order) {
      console.log(`Order not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order found:', order._id);
    res.json(order);
  } catch (err) {
    console.error(`Error fetching order ${req.params.id}:`, err);
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
      
      // Si el pedido se mueve a 'pedido_completo', actualizamos el estado a 'completed'
      // Si se mueve a cualquier otra columna, lo marcamos como 'pending'
      const newStatus = req.body.invoiceStatus === 'pedido_completo' ? 'completed' : 'pending';
      
      console.log(`Synchronizing order status to: ${newStatus} based on invoiceStatus`);
      
      orderData = { 
        invoiceStatus: req.body.invoiceStatus,
        status: newStatus
      };
      
      // Si el pedido se marca como 'pedido_completo', actualizar todas las facturas asociadas
      if (req.body.invoiceStatus === 'pedido_completo') {
        console.log(`Order marked as 'pedido_completo', updating associated invoices...`);
        try {
          // Obtener todas las facturas asociadas al pedido
          const associatedInvoices = existingOrder.associatedInvoices || [];
          
          // Actualizar cada factura
          for (const invoiceId of associatedInvoices) {
            console.log(`Updating status of associated invoice: ${invoiceId}`);
            
            // Actualizar estado de factura a 'pagada' (o su equivalente de completada)
            await Invoice.findByIdAndUpdate(
              invoiceId,
              { status: 'pagada' }, // Actualizar al estado completado para facturas
              { new: true }
            );
          }
          
          console.log(`All associated invoices have been updated to 'pagada' status`);
        } catch (invoiceErr) {
          console.error('Error updating associated invoices:', invoiceErr);
          // No lanzamos error para no interrumpir la actualización del pedido
        }
      }
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


// Obtener facturas abiertas por cliente (para asociar pedidos)
router.get('/invoices/open-by-customer/:customerId', async (req, res) => {
  try {
    console.log(`GET /invoices/open-by-customer/${req.params.customerId} - Obteniendo facturas abiertas`);
    
    // Validar que el ID sea válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.customerId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    // Buscar facturas pendientes para este cliente
    const invoices = await Invoice.find({
      customer: req.params.customerId,
      status: 'pendiente'
    }).populate('customer', 'firstName lastName documentNumber').sort({ issueDate: -1 });
    
    console.log(`Se encontraron ${invoices.length} facturas abiertas para el cliente`);
    res.json(invoices);
  } catch (err) {
    console.error(`Error obteniendo facturas abiertas: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Asociar pedido a factura
router.post('/orders/:orderId/associate-invoice/:invoiceId', async (req, res) => {
  try {
    console.log(`POST /orders/${req.params.orderId}/associate-invoice/${req.params.invoiceId}`);
    
    // Validar IDs
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId) || 
        !mongoose.Types.ObjectId.isValid(req.params.invoiceId)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }
    
    // Buscar el pedido y la factura
    const order = await Order.findById(req.params.orderId);
    const invoice = await Invoice.findById(req.params.invoiceId);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    // Verificar que pertenezcan al mismo cliente
    if (order.customer.toString() !== invoice.customer.toString()) {
      return res.status(400).json({ error: 'El pedido y la factura deben pertenecer al mismo cliente' });
    }
    
    // Agregar el pedido a la factura si no existe ya
    if (!invoice.orders.includes(order._id)) {
      invoice.orders.push(order._id);
      await invoice.save();
    }
    
    // Agregar la factura al pedido si no existe ya
    if (!order.associatedInvoices) {
      order.associatedInvoices = [];
    }
    
    if (!order.associatedInvoices.includes(invoice._id)) {
      order.associatedInvoices.push(invoice._id);
      
      // Actualizar el estado del pedido si está en remito
      if (order.invoiceStatus === 'remito') {
        order.invoiceStatus = 'factura_pendiente';
      }
      
      await order.save();
    }
    
    console.log(`Pedido ${order._id} asociado a factura ${invoice._id}`);
    res.json({ success: true, order, invoice });
  } catch (err) {
    console.error(`Error asociando pedido a factura: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Desasociar pedido de factura
router.post('/orders/:orderId/disassociate-invoice/:invoiceId', async (req, res) => {
  try {
    console.log(`POST /orders/${req.params.orderId}/disassociate-invoice/${req.params.invoiceId}`);
    
    // Validar IDs
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId) || 
        !mongoose.Types.ObjectId.isValid(req.params.invoiceId)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }
    
    // Buscar el pedido y la factura
    const order = await Order.findById(req.params.orderId);
    const invoice = await Invoice.findById(req.params.invoiceId);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    // Eliminar el pedido de la factura
    invoice.orders = invoice.orders.filter(id => id.toString() !== order._id.toString());
    await invoice.save();
    
    // Eliminar la factura del pedido
    if (order.associatedInvoices && order.associatedInvoices.length > 0) {
      order.associatedInvoices = order.associatedInvoices.filter(
        id => id.toString() !== invoice._id.toString()
      );
      
      // Si ya no hay facturas asociadas, volver al estado de remito
      if (order.associatedInvoices.length === 0 && 
          order.invoiceStatus === 'factura_pendiente') {
        order.invoiceStatus = 'remito';
      }
      
      await order.save();
    }
    
    console.log(`Pedido ${order._id} desasociado de factura ${invoice._id}`);
    res.json({ success: true, order, invoice });
  } catch (err) {
    console.error(`Error desasociando pedido de factura: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ======== RUTAS DE FACTURACIÓN ========

// Obtener todas las facturas
router.get('/invoices', async (req, res) => {
  try {
    console.log('GET /invoices - Obteniendo todas las facturas');
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('orders');
    console.log(`Se encontraron ${invoices.length} facturas`);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener una factura por ID
router.get('/invoices/:id', async (req, res) => {
  try {
    console.log(`GET /invoices/${req.params.id} - Obteniendo factura por ID`);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de factura inválido' });
    }
    
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('orders');
    
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    console.log(`Factura encontrada: ${invoice._id}`);
    res.json(invoice);
  } catch (err) {
    console.error(`Error obteniendo factura ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva factura
router.post('/invoices', async (req, res) => {
  try {
    console.log('Datos recibidos para crear factura:', req.body);
    
    // Obtener customer ID si existe un pedido seleccionado
    let customerId = req.body.customer;
    let ordersArray = [];
    
    // Si viene un order pero no orders, convertir a array
    if (req.body.order && !req.body.orders) {
      console.log(`Convirtiendo order ${req.body.order} a formato array`);
      ordersArray.push(req.body.order);
      
      // Si no se envió customer, intentar obtenerlo del pedido
      if (!customerId && mongoose.Types.ObjectId.isValid(req.body.order)) {
        try {
          const order = await Order.findById(req.body.order);
          if (order && order.customer) {
            customerId = order.customer;
            console.log(`Se obtuvo customer ${customerId} del pedido ${req.body.order}`);
          }
        } catch (err) {
          console.error('Error al obtener customer del pedido:', err);
        }
      }
    } else if (req.body.orders && Array.isArray(req.body.orders)) {
      ordersArray = req.body.orders;
    }
    
    // Verificar y preparar datos mínimos necesarios con valores por defecto
    const invoiceData = {
      invoiceType: req.body.invoiceType || 'B',
      customerName: req.body.customerName || 'Consumidor Final',
      documentType: req.body.documentType || 'CUIT',
      documentNumber: req.body.documentNumber || '00000000000',
      address: req.body.address || 'Ciudad',
      items: req.body.items || [],
      subtotal: req.body.subtotal || 0,
      iva21: req.body.iva21 || 0,
      total: req.body.total || 0,
      paymentMethod: req.body.paymentMethod || 'efectivo',
      pointOfSale: req.body.pointOfSale || '0001'
    };
    
    // Si no hay items, crear uno de ejemplo para testing
    if (!invoiceData.items.length) {
      invoiceData.items = [{
        description: 'Producto de ejemplo',
        quantity: 1,
        unitPrice: 100,
        subtotal: 100,
        iva: 21,
        total: 121
      }];
    }
    
    // Generar número de factura
    // En un sistema real, esto se haría a través de la API de AFIP
    let invoiceNumber;
    const lastInvoice = await Invoice.findOne({ 
      invoiceType: invoiceData.invoiceType,
      pointOfSale: invoiceData.pointOfSale
    }).sort({ createdAt: -1 });
    
    if (lastInvoice && lastInvoice.invoiceNumber) {
      // Extraer solo el número (sin el punto de venta)
      const lastNum = lastInvoice.invoiceNumber.split('-')[1];
      const newNum = parseInt(lastNum) + 1;
      invoiceNumber = `${invoiceData.pointOfSale}-${newNum.toString().padStart(8, '0')}`;
    } else {
      invoiceNumber = `${invoiceData.pointOfSale}-00000001`;
    }
    
    // Generar CAE (en un sistema real, esto vendría de AFIP)
    const mockCAE = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
    const mockExpirationDate = new Date();
    mockExpirationDate.setDate(mockExpirationDate.getDate() + 10);
    
    // Crear la nueva factura
    const newInvoice = new Invoice({
      ...invoiceData,
      orders: ordersArray,
      customer: customerId, // Usar el customerId que obtuvimos
      invoiceNumber,
      cae: mockCAE,
      caeExpirationDate: mockExpirationDate,
      status: 'pendiente',
      issueDate: new Date()
    });
    
    // Validar que tengamos un customerId
    if (!newInvoice.customer) {
      console.error('No se proporcionó un cliente válido para la factura');
      return res.status(400).json({ 
        error: 'Se requiere un cliente válido para crear la factura',
        details: 'El campo customer es obligatorio.'
      });
    }
    
    console.log('Creando nueva factura con datos:', newInvoice);
    
    // Guardar en la base de datos
    let savedInvoice;
    try {
      savedInvoice = await newInvoice.save();
      console.log('Factura guardada correctamente:', savedInvoice._id);
      
      // Si hay pedidos asociados, actualizar su estado
      if (newInvoice.orders && newInvoice.orders.length > 0) {
        for (const orderId of newInvoice.orders) {
          if (mongoose.Types.ObjectId.isValid(orderId)) {
            const order = await Order.findById(orderId);
            
            if (order) {
              // Actualizar la relación bidireccional
              if (!order.associatedInvoices) {
                order.associatedInvoices = [];
              }
              
              if (!order.associatedInvoices.includes(savedInvoice._id)) {
                order.associatedInvoices.push(savedInvoice._id);
                
                // Actualizar el estado del pedido
                if (order.invoiceStatus === 'remito') {
                  order.invoiceStatus = 'factura_pendiente';
                }
                
                await order.save();
                console.log(`Pedido ${orderId} actualizado con la factura ${savedInvoice._id}`);
              }
            }
          }
        }
      }
    } catch (saveErr) {
      console.error('Error al guardar la factura:', saveErr);
      
      // Si hay un error de validación, dar un mensaje más claro
      if (saveErr.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Error de validación', 
          details: Object.keys(saveErr.errors).map(key => ({
            field: key,
            message: saveErr.errors[key].message
          }))
        });
      }
      
      throw saveErr; // Propagarlo al catch principal si no es error de validación
    }
    
    res.status(201).json(savedInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estado de factura
router.patch('/invoices/:id/status', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid invoice ID format' });
    }
    
    if (!req.body.status || !['pendiente', 'emitida', 'rechazada', 'anulada'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(updatedInvoice);
  } catch (err) {
    console.error('Error updating invoice status:', err);
    res.status(500).json({ error: err.message });
  }
});

// API para obtener pedidos disponibles para facturar
router.get('/orders/for-invoice', async (req, res) => {
  try {
    console.log('Buscando pedidos disponibles para facturación...');
    // Buscar todos los pedidos y filtrarlos después para depurar
    const allOrders = await Order.find();
    
    console.log(`Total de pedidos encontrados: ${allOrders.length}`);
    
    // Filtrar pedidos que pueden facturarse (cualquier estado excepto 'factura_cobrada')
    // O enviar todos para propósitos de depuración
    const availableOrders = allOrders;
    
    console.log(`Pedidos disponibles para facturar: ${availableOrders.length}`);
    console.log('Enviando pedidos para facturación');
    
    res.json(availableOrders);
  } catch (err) {
    console.error('Error fetching available orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ruta alternativa para probar si hay pedidos en la base de datos
router.get('/orders-simple', async (req, res) => {
  try {
    console.log('Obteniendo todos los pedidos para depuración...');
    const orders = await Order.find();
    console.log(`Total pedidos encontrados: ${orders.length}`);
    res.json(orders);
  } catch (err) {
    console.error('Error obteniendo pedidos:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
