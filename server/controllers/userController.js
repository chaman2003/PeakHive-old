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
    console.log('Register request received:', JSON.stringify(req.body));
    
    const { firstName, lastName, email, phone, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      console.error('Missing required fields:', { firstName: !!firstName, lastName: !!lastName, email: !!email, password: !!password });
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { firstName: !!firstName, lastName: !!lastName, email: !!email, password: !!password }
      });
    }
    
    // Validate password length (matches User model requirement)
    if (password.length < 8) {
      console.error('Password too short');
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    console.log('Creating new user:', { 
      firstName, 
      lastName, 
      email, 
      hasPhone: !!phone,
      phoneValue: phone || '[not provided]'
    });
    
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    if (user) {
      console.log('User created successfully:', user._id);
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      console.error('User creation failed with no error');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack 
    });
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

    // Check if test query parameter is present
    const useTestDB = req.query.test === 'true';
    
    if (useTestDB) {
      console.log('Fetching user profile from test database for user:', req.user._id);
      
      // Fetch from test collection
      const userId = req.user._id;
      try {
        const testUser = await User.db.collection('test/users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
        
        if (testUser) {
          console.log('Found user in test database with fields:', Object.keys(testUser));
          console.log('Phone from test database:', testUser.phone || '[not set]');
          
          res.json({
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email,
            phone: testUser.phone,
            role: testUser.role,
            profileImage: testUser.profileImage,
            addresses: testUser.addresses,
          });
        } else {
          // If not found in test DB, try regular DB
          console.log('User not found in test DB, checking regular DB');
          const user = await User.findById(req.user._id);
          
          if (user) {
            console.log('Found user in regular database');
            console.log('Phone from regular database:', user.phone || '[not set]');
            
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
            res.status(404).json({ message: 'User not found in any database' });
          }
        }
      } catch (error) {
        console.error('Error querying test database:', error);
        res.status(500).json({ message: 'Error accessing test database' });
      }
    } else {
      // Regular flow - fetch from normal collection
      const user = await User.findById(req.user._id);

      if (user) {
        console.log('Regular profile fetch - phone:', user.phone || '[not set]');
        
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
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
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
    
    console.log(`Starting deletion process for user ${user._id}`);
    
    try {
      // Delete user's cart
      const cartResult = await Cart.deleteMany({ user: user._id });
      console.log(`Deleted ${cartResult.deletedCount} cart items`);
      
      // Delete user's wishlist
      const wishlistResult = await Wishlist.deleteMany({ userId: user._id });
      console.log(`Deleted ${wishlistResult.deletedCount} wishlist items`);
      
      // Delete user's reviews
      const reviewResult = await Review.deleteMany({ user: user._id });
      console.log(`Deleted ${reviewResult.deletedCount} reviews`);
      
      // Find all orders by this user
      const userOrders = await Order.find({ user: user._id });
      console.log(`Found ${userOrders.length} orders`);
      
      // Delete payment records associated with user's orders
      for (const order of userOrders) {
        const paymentResult = await Payment.deleteMany({ orderId: order._id });
        console.log(`Deleted ${paymentResult.deletedCount} payments for order ${order._id}`);
      }
      
      // Delete all user's orders
      const orderResult = await Order.deleteMany({ user: user._id });
      console.log(`Deleted ${orderResult.deletedCount} orders`);
      
      // Finally delete the user
      await User.findByIdAndDelete(user._id);
      console.log(`User ${user._id} deleted successfully`);
      
      res.json({ message: 'User and all associated data removed successfully' });
    } catch (error) {
      console.error('Error in deletion sequence:', error);
      throw error; // Rethrow for the outer catch block
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
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
      // Log all incoming update fields
      console.log('Updating user with ID:', req.params.id);
      console.log('Update data received:', {
        firstName: req.body.firstName || '[unchanged]',
        lastName: req.body.lastName || '[unchanged]',
        email: req.body.email || '[unchanged]',
        role: req.body.role || '[unchanged]',
        phone: req.body.phone || '[unchanged]',
        profileImage: req.body.profileImage ? '[new image]' : '[unchanged]',
        hasAddresses: req.body.addresses ? 'yes' : 'no'
      });
      
      // Log phone number change specifically 
      if (req.body.phone !== undefined) {
        console.log(`Phone number update: "${user.phone}" -> "${req.body.phone}"`);
      }

      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.profileImage = req.body.profileImage || user.profileImage;
      
      // Handle address updates if present
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      const updatedUser = await user.save();
      console.log('User updated successfully:', updatedUser._id);

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
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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