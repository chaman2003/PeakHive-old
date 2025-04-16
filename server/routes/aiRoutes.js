import express from 'express';
import { chatWithAI, checkAIStatus } from '../controllers/aiController.js';

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Process AI chat message
// @access  Public
router.post('/chat', chatWithAI);

// @route   GET /api/ai/status
// @desc    Check AI service availability
// @access  Public
router.get('/status', checkAIStatus);

export default router;