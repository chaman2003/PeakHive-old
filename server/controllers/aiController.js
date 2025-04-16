import axios from 'axios';
import dotenv from 'dotenv';
import process from 'process';
import { logger } from '../utils/logger.js';

// Configure dotenv to access environment variables
dotenv.config();

// Blocked keywords or phrases
const BLOCKED_KEYWORDS = [
  'illegal', 'hack', 'suicide', 'bomb', 'kill', 'murder', 'terrorist',
  'pornography', 'child abuse', 'drugs', 'cocaine', 'heroin', 'steal',
  'counterfeit', 'fraud'
];

// Location restrictions
const RESTRICTED_LOCATIONS = ['north korea', 'iran', 'cuba', 'syria', 'crimea'];

/**
 * Chat with AI
 * @route POST /api/ai/chat
 * @access Public
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check for blocked content
    const lowerCaseMessage = message.toLowerCase();
    
    // Check for restricted locations
    const isRestrictedLocation = RESTRICTED_LOCATIONS.some(location => 
      lowerCaseMessage.includes(location));
    
    if (isRestrictedLocation) {
      return res.status(403).json({ 
        message: 'Due to international regulations, this service is not available in your region.' 
      });
    }
    
    // Check for blocked keywords
    const containsBlockedKeyword = BLOCKED_KEYWORDS.some(keyword => 
      lowerCaseMessage.includes(keyword));
    
    if (containsBlockedKeyword) {
      return res.status(403).json({ 
        message: 'Your query contains prohibited content. Please rephrase your question.' 
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.error('Gemini API key not found');
      return res.status(500).json({ message: 'AI service configuration error' });
    }
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      }
    );
    
    // Extract the response text
    let responseText = '';
    
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0] && 
        response.data.candidates[0].content.parts[0].text) {
      responseText = response.data.candidates[0].content.parts[0].text;
    } else {
      logger.warn('Unexpected response structure from Gemini API', { response: JSON.stringify(response.data) });
      responseText = 'I apologize, but I couldn\'t process your request at this time.';
    }
    
    return res.json({ response: responseText });
    
  } catch (error) {
    logger.error('Error in chatWithAI', { error: error.message, stack: error.stack });
    
    // Check for specific error responses
    if (error.response) {
      const status = error.response.status;
      logger.error('Gemini API error response', { 
        status, 
        data: JSON.stringify(error.response.data) 
      });
      
      if (status === 400) {
        return res.status(400).json({ 
          message: 'The AI couldn\'t process your request. Please try a different question.' 
        });
      }
      
      if (status === 429) {
        return res.status(429).json({ 
          message: 'Too many requests to the AI service. Please try again later.' 
        });
      }
    }
    
    return res.status(500).json({ 
      message: 'An error occurred while communicating with the AI service.'
    });
  }
};

/**
 * Check AI availability
 * @route POST /api/ai/status
 * @access Public
 */
export const checkAIStatus = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.error('Gemini API key not found');
      return res.status(200).json({ available: false });
    }
    
    // Just check if we can connect to the API
    await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: 'Hello'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10,
        }
      }
    );
    
    return res.status(200).json({ available: true });
  } catch (error) {
    logger.error('AI service unavailable', { error: error.message });
    return res.status(200).json({ available: false });
  }
}; 