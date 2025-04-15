import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
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
} from '../controllers/orderController.js';

const router = express.Router();

// Order routes
router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, admin, getOrderStats);

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, admin, updateOrderStatus)
  .delete(protect, deleteOrder);
  
router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

// Cancel order route
router.route('/:id/cancel')
  .put(protect, cancelOrder);

// Refund order route
router.route('/:id/refund')
  .put(protect, admin, refundOrder);

export default router; 