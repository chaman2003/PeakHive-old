/* eslint-env node */
/* eslint-disable no-undef */

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Special case for admin demo login
    if ((email === 'admin' || email === 'admin@peakhive.com') && password === '123') {
      console.log('Admin demo login detected');
      // For demo only: hardcoded admin credentials
      // In production, this would be replaced with proper admin authentication
      const adminId = 'admin123456789012345678'; // Mock MongoDB ObjectID format
      return res.json({
        _id: adminId,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@peakhive.com',
        role: 'admin',
        profileImage: 'https://placehold.co/200/6a5acd/ffffff?text=Admin',
        token: generateToken(adminId),
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user || !req.user._id) {
      console.error('getUserProfile called without valid user in request');
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    // User is attached to req from the protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user || !req.user._id) {
      console.error('updateUserProfile called without valid user in request');
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.profileImage = req.body.profileImage || user.profileImage;

      // Handle address updates if present
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        addresses: updatedUser.addresses,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new address
// @route   POST /api/users/address
// @access  Private
const addUserAddress = async (req, res) => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user || !req.user._id) {
      console.error('addUserAddress called without valid user in request');
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const { street, city, state, zip, country } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const address = {
        street,
        city,
        state,
        zip,
        country
      };

      user.addresses.push(address);
      await user.save();

      res.status(201).json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in addUserAddress:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search parameters
    const searchTerm = req.query.search || '';
    
    // Test database flag
    const useTestDB = req.query.test === 'true';
    
    // Build filter
    let filter = {};
    
    if (searchTerm) {
      // Search by name or email
      filter = {
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }
    
    // Log the database being used
    console.log(`Fetching users from ${useTestDB ? 'test' : 'production'} database`);
    
    // If test flag is set, switch to test database collection
    const userCollection = useTestDB ? 'test/users' : 'users';
    
    // Count total for pagination
    const total = useTestDB 
      ? await User.collection.countDocuments(filter, { collectionName: userCollection })
      : await User.countDocuments(filter);
    
    // Fetch users
    let users;
    if (useTestDB) {
      // For test database
      users = await User.db.collection(userCollection)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } else {
      // From regular User model
      users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    
    // Return paginated results
    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Import necessary models if they're not already imported at the top of the file
    const Cart = (await import('../models/Cart.js')).default;
    const Wishlist = (await import('../models/Wishlist.js')).default;
    const Review = (await import('../models/Review.js')).default;
    const Order = (await import('../models/Order.js')).default;
    const Payment = (await import('../models/Payment.js')).default;
    
    // Delete all associated data in a transaction to ensure consistency
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Delete user's cart
      await Cart.deleteMany({ user: user._id }, { session });
      
      // Delete user's wishlist
      await Wishlist.deleteMany({ userId: user._id }, { session });
      
      // Delete user's reviews
      await Review.deleteMany({ user: user._id }, { session });
      
      // Find all orders by this user
      const userOrders = await Order.find({ user: user._id }, { session });
      
      // Delete payment records associated with user's orders
      for (const order of userOrders) {
        await Payment.deleteMany({ orderId: order._id }, { session });
      }
      
      // Delete all user's orders
      await Order.deleteMany({ user: user._id }, { session });
      
      // Finally delete the user
      await User.findByIdAndDelete(user._id, { session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      res.json({ message: 'User and all associated data removed successfully' });
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error; // Rethrow for the outer catch block
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone || user.phone;
      user.profileImage = req.body.profileImage || user.profileImage;
      
      // Handle address updates if present
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        addresses: updatedUser.addresses
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  getUsers,
  deleteUser,
  getUserById,
  updateUser
}; 