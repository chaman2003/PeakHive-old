import express from 'express';
import { processPayment, getPaymentStatus, getPayments, updatePaymentStatus } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Payment routes for regular users
router.post('/', protect, processPayment);
router.get('/status/:id', protect, getPaymentStatus);

// Admin payment routes 
// Changed from /admin to /admin/list to avoid conflict with :id parameter
router.get('/admin/list', protect, admin, getPayments);
router.put('/admin/:id', protect, admin, updatePaymentStatus);

export default router; 