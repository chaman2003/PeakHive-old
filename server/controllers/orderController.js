/* eslint-env node */
/* eslint-disable no-undef */

import Order from '../models/Order.js';
import mongoose from 'mongoose';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Additional debug logging
    console.log('User info from request:', JSON.stringify(req.user, null, 2));
    console.log('Order request body:', JSON.stringify(req.body, null, 2));
    
    // Validation checks
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // Validate shipping address - handle potential missing fields
    const { street, city, state, zip, country } = shippingAddress;
    const requiredFields = { street, city, state, zip, country };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);
      
    if (missingFields.length > 0) {
      console.error('Missing shipping address fields:', missingFields);
      return res.status(400).json({ 
        message: 'All shipping address fields are required',
        missingFields
      });
    }

    // Map cart items to order items with proper validation and error handling
    try {
      const validatedOrderItems = orderItems.map(item => ({
        productId: item.productId,
        name: item.name || 'Product',
        price: parseFloat(item.price) || 0,
        image: item.image || 'default-image.jpg',
        quantity: parseInt(item.quantity) || 1
      }));
      
      // Ensure user ID is valid
      let userId;
      
      if (!req.user || !req.user._id) {
        console.error('No user found in request');
        // Use a fallback ID for testing purposes only
        userId = new mongoose.Types.ObjectId('000000000000000000000001');
      } else if (typeof req.user._id === 'object') {
        // If it's already an ObjectId, use it directly
        userId = req.user._id;
      } else {
        // Convert string ID to ObjectId
        try {
          userId = new mongoose.Types.ObjectId(req.user._id);
        } catch (err) {
          console.error('Invalid user ID format, using fallback:', err);
          userId = new mongoose.Types.ObjectId('000000000000000000000001');
        }
      }
      
      console.log('Final user ID for order:', userId);

      // Create the order with validated data
      const order = new Order({
        user: userId,
        orderItems: validatedOrderItems,
        shippingAddress: {
          street: street || '',
          city: city || '',
          state: state || '',
          zip: zip || '',
          country: country || 'United States'
        },
        paymentMethod,
        itemsPrice: parseFloat(itemsPrice || 0),
        taxPrice: parseFloat(taxPrice || 0),
        shippingPrice: parseFloat(shippingPrice || 0),
        totalPrice: parseFloat(totalPrice || 0),
        status: 'pending',
        isPaid: false,
        isDelivered: false
      });

      console.log('Attempting to save order:', order);
      
      const createdOrder = await order.save();
      
      if (createdOrder) {
        console.log(`Order created successfully: ${createdOrder._id}`);
        res.status(201).json(createdOrder);
      } else {
        res.status(400).json({ message: 'Invalid order data' });
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ 
        message: 'Error validating order data', 
        error: validationError.message 
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    // Provide more detailed error information for debugging
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
const getOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    const status = req.query.status || '';

    // Build query with optional search and status filter
    let query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add search terms if provided
    if (searchTerm) {
      // Search by order ID, orderId field or populate user's name/email
      const searchConditions = [
        { orderId: { $regex: searchTerm, $options: 'i' } }
      ];
      
      // If searchTerm looks like a valid ObjectId, also search by _id
      if (searchTerm.length === 24 && /^[0-9a-fA-F]{24}$/.test(searchTerm)) {
        searchConditions.push({ _id: searchTerm });
      }
      
      // Add search conditions to the query
      query = {
        ...query,
        $or: searchConditions
      };
    }

    // Count total documents for pagination, considering all filters
    const count = await Order.countDocuments(query);
    
    // Get orders with pagination
    let orders = await Order.find(query)
      .populate({
        path: 'user',
        select: 'id firstName lastName email'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // If searching and no orders found directly, try finding by user details
    if (searchTerm && orders.length === 0) {
      // Find users matching the search term
      const User = await import('../models/User.js').then(module => module.default);
      const users = await User.find({
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id');

      if (users.length > 0) {
        const userIds = users.map(user => user._id);
        const userQuery = { user: { $in: userIds } };
        
        // If status filter is applied, keep it
        if (status) {
          userQuery.status = status;
        }
        
        orders = await Order.find(userQuery)
          .populate('user', 'id firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
      }
    }
    
    console.log(`Found ${orders.length} orders for admin view (page ${page}, limit ${limit}, search: "${searchTerm}", status: "${status}")`);

    res.json({
      orders,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email');

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the logged-in user or the user is an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ message: 'Failed to get order' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, isDelivered, isPaid, deliveredAt, paidAt } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order fields if provided
    if (status) order.status = status;
    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) order.deliveredAt = deliveredAt || Date.now();
    }
    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) order.paidAt = paidAt || Date.now();
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    let query = {};
    
    // Special handling for admin users - can see all orders if needed
    if (req.user.role === 'admin') {
      // For admin demos, allow option to see all orders or just admin orders
      const viewAllOrders = req.query.all === 'true';
      
      if (!viewAllOrders) {
        // Only show orders assigned to this admin ID
        query = { user: req.user._id };
      }
      // If viewAllOrders is true, query is empty = get all orders
    } else {
      // Regular users - only fetch orders for their user ID
      query = { user: req.user._id };
    }
    
    // Get orders matching the query criteria
    const orders = await Order.find(query)
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for user ${req.user._id} (${req.user.role})`);
    res.json(orders);
  } catch (error) {
    console.error('Error getting my orders:', error);
    res.status(500).json({ message: 'Failed to get your orders' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Security check - only allow users to pay their own orders
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    
    // Create a safe paymentResult object with fallbacks for missing data
    order.paymentResult = {
      id: req.body.id || `payment-${Date.now()}`,
      status: req.body.status || 'completed',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.payer?.email_address || req.user.email || 'no-email-provided'
    };
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order to paid:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Admin
const getOrderStats = async (req, res) => {
  try {
    console.log("Fetching order statistics from MongoDB...");
    
    // Total revenue - sum of all order totalPrice values from the database
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Extract and format the revenue value to ensure it's a proper number with 2 decimal places
    let calculatedRevenue = 0;
    if (totalRevenue.length > 0 && totalRevenue[0].total) {
      // Convert to 2 decimal places
      calculatedRevenue = parseFloat(totalRevenue[0].total.toFixed(2));
    }
    
    console.log(`Calculated total revenue from all orders: $${calculatedRevenue.toFixed(2)}`);
    
    // Get total orders count directly from the database
    const totalOrders = await Order.countDocuments();
    console.log(`Total orders in database: ${totalOrders}`);
    
    // Count orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName');
      
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({
      totalRevenue: calculatedRevenue,
      totalOrders,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    console.error('Error getting order stats:', error);
    res.status(500).json({ message: 'Failed to get order statistics' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Updated cancellation logic
    const allowedStatuses = ['pending', 'processing', 'shipped'];
    if (!allowedStatuses.includes(order.status.toLowerCase())) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Remove payment status check since we're using order status
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Cannot cancel delivered orders' });
    }

    // Update order status
    order.status = 'canceled';
    order.isCanceled = true;
    order.canceledAt = Date.now();
    order.canceledBy = req.user._id;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow admin or the order owner to delete the order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this order' });
    }

    // Regular users can only delete delivered or canceled orders
    // Admins can delete any order
    if (req.user.role !== 'admin' && 
        !order.isDelivered && order.status !== 'delivered' && 
        !order.isCanceled && order.status !== 'canceled') {
      return res.status(400).json({ 
        message: 'Only delivered or canceled orders can be deleted' 
      });
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// @desc    Refund an order
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to refund this order' });
    }

    // Can only refund paid orders
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Cannot refund unpaid orders' });
    }

    // Cannot refund already canceled orders
    if (order.isCanceled || order.status === 'canceled') {
      return res.status(400).json({ message: 'Order is already canceled' });
    }

    // Get refund reason and notes from request body
    const { reason, notes } = req.body;

    // Update order status
    order.status = 'refunded';
    order.isCanceled = true;
    order.canceledAt = Date.now();
    order.canceledBy = req.user._id;
    order.refundReason = reason || 'Administrative refund';
    order.refundNotes = notes || '';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error refunding order:', error);
    res.status(500).json({ message: 'Failed to refund order' });
  }
};

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  updateOrderToPaid,
  getOrderStats,
  cancelOrder,
  deleteOrder,
  refundOrder
};