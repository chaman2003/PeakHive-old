import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessage,
  deleteContactMessage
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createContactMessage);

// Admin routes
router.route('/')
  .get(protect, admin, getContactMessages);

router.route('/:id')
  .get(protect, admin, getContactMessageById)
  .put(protect, admin, updateContactMessage)
  .delete(protect, admin, deleteContactMessage);

export default router; 