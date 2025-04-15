import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCount
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get product categories (placeholder)
const getCategories = (req, res) => {
  res.json({
    categories: [
      { name: 'Electronics', count: 12 },
      { name: 'Clothing', count: 8 },
      { name: 'Home & Kitchen', count: 15 },
      { name: 'Books', count: 20 },
      { name: 'Beauty', count: 10 }
    ]
  });
};

// Public routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/categories', getCategories);

// Product count route for dashboard
router.get('/count', protect, admin, getProductCount);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router; 