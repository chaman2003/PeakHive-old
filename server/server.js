/* eslint-env node */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

// Import routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://peakhive.vercel.app', 'https://www.peakhive.vercel.app'] 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

// Print important environment variables for debugging (without revealing secrets)
console.log('Environment variables loaded:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- PORT:', process.env.PORT || 5000);
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

// Enhanced MongoDB connection with more options
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => {
    console.log('MongoDB Connected Successfully');
    // Start server only after MongoDB connection is established
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    console.log('Please check if MongoDB Atlas is accessible and credentials are correct');
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Mongoose connection error handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'PeakHive API is running' });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}); 