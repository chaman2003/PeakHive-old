import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Process payment for an order
 * @route   POST /api/payments
 * @access  Private
 */
const processPayment = async (req, res) => {
  try {
    const { 
      orderId, 
      paymentMethod, 
      transactionId, 
      amount,
      status = 'completed' 
    } = req.body;

    if (!orderId || !paymentMethod || !amount) {
      return res.status(400).json({ message: 'Please provide all required payment details' });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to process this payment' });
    }

    // Create new payment
    const payment = await Payment.create({
      userId: req.user._id,
      orderId: orderId,
      transactionId: transactionId || `TXN${Date.now()}`,
      paymentMethod,
      amount,
      status
    });

    // Update order with payment information
    order.paymentStatus = 'paid';
    await order.save();

    res.status(201).json({ 
      success: true, 
      payment 
    });
  } catch (error) {
    console.error(`Error processing payment: ${error.message}`);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};

/**
 * @desc    Get payment status by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Ensure user can only see their own payments unless admin
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view this payment' });
    }

    res.status(200).json({ 
      success: true, 
      payment 
    });
  } catch (error) {
    console.error(`Error getting payment status: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving payment information' });
  }
};

/**
 * @desc    Get all payments (admin)
 * @route   GET /api/payments/admin
 * @access  Private/Admin
 */
const getPayments = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    // Filter options
    const searchTerm = req.query.search || '';
    const paymentMethod = req.query.paymentMethod || '';
    
    // Build the query
    const query = {};
    
    if (searchTerm) {
      query.transactionId = { $regex: searchTerm, $options: 'i' };
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    const count = await Payment.countDocuments(query);
    
    const payments = await Payment.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderId totalAmount')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.status(200).json({
      success: true,
      payments,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error(`Error getting payments: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving payments' });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/payments/:id
 * @access  Private/Admin
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Please provide payment status' });
    }
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment status
    payment.status = status;
    
    // If marked as refunded, update corresponding order
    if (status === 'refunded') {
      const order = await Order.findById(payment.orderId);
      
      if (order) {
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error(`Error updating payment status: ${error.message}`);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};

export {
  processPayment,
  getPaymentStatus,
  getPayments,
  updatePaymentStatus
}; 