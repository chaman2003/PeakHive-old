import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    // Find the user's wishlist and populate product details
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate({
        path: 'productIds',
        select: 'name price images stock rating description'
      });
    
    if (!wishlist) {
      // If no wishlist exists, return an empty one
      return res.json({ products: [] });
    }
    
    res.json({ products: wishlist.productIds });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Find the user's wishlist or create one if it doesn't exist
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        productIds: [productId]
      });
    } else {
      // Check if product already exists in the wishlist
      if (wishlist.productIds.includes(productId)) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      
      // Add the product to the wishlist
      wishlist.productIds.push(productId);
    }
    
    await wishlist.save();
    
    res.status(201).json({ 
      message: 'Product added to wishlist successfully',
      wishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Remove the product from the wishlist
    wishlist.productIds = wishlist.productIds.filter(
      id => id.toString() !== productId
    );
    
    await wishlist.save();
    
    res.json({ 
      message: 'Product removed from wishlist successfully',
      wishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    // Find and update the user's wishlist to have empty product array
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { productIds: [] } },
      { new: true }
    );
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    res.json({ 
      message: 'Wishlist cleared successfully',
      wishlist
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Server error clearing wishlist' });
  }
};

// Wishlist routes
router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

router.route('/clear')
  .delete(protect, clearWishlist);

export default router;