import express from 'express';
import { getUserCart, updateUserCart, clearUserCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require login
router.route('/')
  .get(protect, getUserCart)
  .post(protect, updateUserCart)
  .delete(protect, clearUserCart);

export default router; 