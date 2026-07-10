import Order from '../models/Order.js';
import Pizza from '../models/Pizza.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { emitToAdmins, emitToOrderRoom } from '../socket/socketHandler.js';

// Helper: Check if ingredients are available for an order
const validateInventoryForItems = async (items) => {
  const stockNeeded = {}; // Map of ingredientId -> needed quantity

  for (const item of items) {
    const qty = item.quantity;

    if (item.isCustomized) {
      // Find ingredient requirements for customized builders
      const details = item.customizationDetails;
      const ingredientsToQuery = [];

      if (details.base) ingredientsToQuery.push({ name: details.base, amount: 1 });
      if (details.sauce) ingredientsToQuery.push({ name: `${details.sauce} Sauce`, amount: 1 });
      if (details.cheese) ingredientsToQuery.push({ name: details.cheese, amount: 1 });
      
      if (details.veggies && Array.isArray(details.veggies)) {
        details.veggies.forEach(v => ingredientsToQuery.push({ name: v, amount: 1 }));
      }
      if (details.toppings && Array.isArray(details.toppings)) {
        details.toppings.forEach(t => ingredientsToQuery.push({ name: t, amount: 1 }));
      }

      for (const ing of ingredientsToQuery) {
        const dbIng = await Inventory.findOne({ name: { $regex: `^${ing.name}$`, $options: 'i' } });
        if (!dbIng) {
          throw new Error(`Ingredient "${ing.name}" is currently unavailable in our inventory database.`);
        }
        const ingId = dbIng._id.toString();
        stockNeeded[ingId] = (stockNeeded[ingId] || 0) + (ing.amount * qty);
      }
    } else {
      // Standard pizza recipe check
      const pizza = await Pizza.findById(item.pizza).populate('ingredients.ingredient');
      if (!pizza) {
        throw new Error(`Pizza item with ID ${item.pizza} not found`);
      }

      if (!pizza.isAvailable) {
        throw new Error(`Pizza "${pizza.name}" is currently sold out`);
      }

      for (const rec of pizza.ingredients) {
        if (!rec.ingredient) continue;
        const ingId = rec.ingredient._id.toString();
        stockNeeded[ingId] = (stockNeeded[ingId] || 0) + (rec.quantityRequired * qty);
      }
    }
  }

  // Verify against database stocks
  const errors = [];
  for (const [ingId, needed] of Object.entries(stockNeeded)) {
    const ing = await Inventory.findById(ingId);
    if (!ing || ing.quantity < needed) {
      errors.push(`${ing ? ing.name : 'Unknown ingredient'} (needed: ${needed}, in stock: ${ing ? ing.quantity : 0})`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Insufficient stock for ingredients: ${errors.join(', ')}`);
  }

  return stockNeeded;
};

// Helper: Deduct stock after successful payment
const deductInventoryStock = async (stockNeeded) => {
  for (const [ingId, quantityToDeduct] of Object.entries(stockNeeded)) {
    await Inventory.findByIdAndUpdate(ingId, {
      $inc: { quantity: -quantityToDeduct }
    });
  }
};

/**
 * Place a new Order (Step 1: Check inventory, Calculate prices, Create Order & Razorpay transaction)
 */
export const createOrder = async (req, res, next) => {
  const { items, shippingAddress, couponCode } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
    return res.status(400).json({ success: false, message: 'Complete shipping address and phone number are required' });
  }

  try {
    // 1. Validate inventory stock
    let stockNeeded;
    try {
      stockNeeded = await validateInventoryForItems(items);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // 2. Calculate prices
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    // 3. Handle Coupon discount
    let discount = 0;
    if (couponCode) {
      const normalizedCoupon = couponCode.trim().toUpperCase();
      if (normalizedCoupon === 'PIZZA50') {
        discount = subtotal * 0.5; // 50% off
      } else if (normalizedCoupon === 'WELCOME100' && subtotal >= 400) {
        discount = 100; // Flat 100 off on order >= 400
      } else if (normalizedCoupon === 'FREESHIP') {
        discount = 40; // Flat 40 off
      }
    }

    const totalAmount = Math.max(subtotal - discount, 0);

    // 4. Create Order in Database (Status: Pending Payment)
    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      discountAmount: discount,
      couponCode,
      shippingAddress,
      paymentStatus: 'pending'
    });

    // 5. Trigger Razorpay Order creation
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(totalAmount, order._id.toString());
    } catch (err) {
      // Rollback database order creation if payment order generation fails
      await Order.findByIdAndDelete(order._id);
      return res.status(500).json({ success: false, message: `Payment Gateway Error: ${err.message}` });
    }

    // 6. Create initial Payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      status: 'pending'
    });

    // Link payment ID to Order
    order.paymentDetails = payment._id;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created. Payment initialization successful.',
      order,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Payment Signature (Step 2: Authenticate payments, update status, deduct stock, send emails)
 */
export const verifyPayment = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing required Razorpay parameters' });
  }

  try {
    // 1. Verify cryptographic signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    
    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const order = await Order.findById(payment.order).populate('user', 'email name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found' });
    }

    if (!isValid) {
      // Payment verification failed
      payment.status = 'failed';
      await payment.save();

      order.paymentStatus = 'failed';
      await order.save({ validateBeforeSave: false });

      return res.status(400).json({ success: false, message: 'Payment signature validation failed.' });
    }

    // 2. Double check stock levels in database right before final deduction
    let stockNeeded;
    try {
      stockNeeded = await validateInventoryForItems(order.items);
    } catch (err) {
      // If stock runs out between step 1 and step 2, refund is needed. Mark order failed.
      payment.status = 'failed';
      await payment.save();

      order.paymentStatus = 'failed';
      await order.save({ validateBeforeSave: false });

      return res.status(400).json({ success: false, message: `Stock ran out before payment cleared: ${err.message}` });
    }

    // 3. Deduct ingredient inventory
    await deductInventoryStock(stockNeeded);

    // 4. Update Payment & Order Status to paid
    payment.status = 'success';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();

    order.paymentStatus = 'paid';
    await order.save({ validateBeforeSave: false });

    // 5. Send order confirmation email
    await sendOrderConfirmationEmail(order.user.email, order);

    // 6. Create User notifications
    const notification = await Notification.create({
      user: order.user._id,
      title: 'Order Confirmed! 🍕',
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been received and is being sent to the kitchen.`,
      type: 'order'
    });

    // 7. Emit real-time tracking updates via socket.io
    emitToOrderRoom(order._id.toString(), 'order_status_updated', {
      status: 'received',
      paymentStatus: 'paid'
    });

    // Emit live alert to admin panel
    emitToAdmins('new_order', {
      orderId: order._id,
      userName: order.user.name,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order finalized successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders history of logged-in user
 */
export const getUserOrders = async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a single order (User who ordered or Admin)
 */
export const getOrderById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('paymentDetails');
      
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all orders (Paginated, Filterable by status)
 */
export const getAllOrders = async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const status = req.query.status || '';
  const skip = (page - 1) * limit;

  try {
    const query = {};
    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update status of order (received -> preparing -> kitchen -> delivery -> delivered)
 */
export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['received', 'preparing', 'kitchen', 'delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  try {
    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save({ validateBeforeSave: false });

    // Notify customer via user notification
    const statusTitles = {
      preparing: 'Preparing your Pizza! 🍳',
      kitchen: 'Baking in the oven! 🔥',
      delivery: 'Out for delivery! 🛵',
      delivered: 'Pizza Delivered! 🎉'
    };

    const statusMessages = {
      preparing: 'Our chefs have started preparing your handcrafted pizza.',
      kitchen: 'Your pizza is baking in the oven for maximum crunch.',
      delivery: 'Our delivery agent is heading to your address.',
      delivered: 'Your order was successfully delivered. Enjoy your meal!'
    };

    if (statusTitles[status]) {
      await Notification.create({
        user: order.user._id,
        title: statusTitles[status],
        message: `${statusMessages[status]} (Order #${order._id.toString().slice(-6).toUpperCase()})`,
        type: 'order'
      });
    }

    // Emit live update event to tracking clients
    emitToOrderRoom(order._id.toString(), 'order_status_updated', {
      status,
      paymentStatus: order.paymentStatus
    });

    res.status(200).json({
      success: true,
      message: `Order status changed to: ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Dashboard Statistics & Chart Aggregations
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Simple count stats
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPizzas = await Pizza.countDocuments({});

    // 2. Revenue aggregation
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 3. Sales Trend by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing dates in trend
    const filledSalesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = salesTrend.find(item => item._id === dateStr);
      filledSalesTrend.push({
        date: dateStr,
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    // 4. Category breakdown
    const categoryStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 5. Recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalPizzas,
        totalRevenue
      },
      salesTrend: filledSalesTrend,
      categoryStats,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};
