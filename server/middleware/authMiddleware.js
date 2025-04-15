/* eslint-env node */
/* eslint-disable no-undef */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Configure environment variables
dotenv.config();

// Middleware to verify user is authenticated
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        console.error('Token is undefined or empty in the Authorization header');
        return res.status(401).json({ message: 'Not authorized, token is missing' });
      }

      // Verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Special case for admin demo user
        if (decoded.id && decoded.id.startsWith('admin')) {
          // Create a valid MongoDB ObjectId for admin users
          // Either use a pre-defined admin ID or generate a consistent one
          const adminId = new mongoose.Types.ObjectId('000000000000000000000001');
          
          // Create a mock user object for the admin with a valid ObjectId
          req.user = {
            _id: adminId,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@peakhive.com',
            role: 'admin',
            profileImage: 'https://placehold.co/200/6a5acd/ffffff?text=Admin'
          };
          return next();
        }

        if (!decoded.id) {
          console.error('Token decoded but id is missing:', decoded);
          return res.status(401).json({ message: 'Invalid token format' });
        }

        // Regular users: Get user from database (exclude password)
        try {
          const user = await User.findById(decoded.id).select('-password');

          if (!user) {
            console.error('User not found with ID:', decoded.id);
            return res.status(401).json({ message: 'Not authorized, user not found' });
          }

          // Attach user to request
          req.user = user;
          next();
        } catch (dbError) {
          console.error('Database error when finding user:', dbError);
          if (dbError.name === 'MongooseError' && dbError.message.includes('buffering timed out')) {
            return res.status(503).json({ message: 'Database connection issue, please try again later' });
          }
          return res.status(500).json({ message: 'Server error while authenticating' });
        }
      } catch (jwtError) {
        // Handle specific JWT errors
        if (jwtError.name === 'TokenExpiredError') {
          console.error('Token expired:', jwtError);
          return res.status(401).json({ message: 'Token expired, please login again' });
        } else if (jwtError.name === 'JsonWebTokenError') {
          console.error('Invalid token:', jwtError);
          return res.status(401).json({ message: 'Invalid token' });
        } else {
          console.error('Token validation error:', jwtError);
          return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, authentication failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to verify if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

export { protect, admin }; 