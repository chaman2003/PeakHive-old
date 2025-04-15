import express from 'express';
import {
  createReview,
  getProductReviews,
  getAllReviews,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Placeholder for review controller
const updateReview = (req, res) => res.json({ message: 'Update review endpoint' });

// Review routes
router.route('/')
  .post(protect, createReview)
  .get(protect, admin, getAllReviews);

router.route('/product/:id')
  .get(getProductReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router; 