import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find cart by user ID
    let cart = await Cart.findOne({ user: userId });
    
    // If no cart exists yet, return empty array
    if (!cart) {
      return res.json([]);
    }
    
    res.json(cart.items || []);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: 'Server error getting cart' });
  }
};

// @desc    Update user cart
// @route   POST /api/cart
// @access  Private
const updateUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItems } = req.body;
    
    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'Cart items must be an array' });
    }
    
    console.log(`Updating cart for user ${userId} with ${cartItems.length} items`);
    
    // Find cart or create new one using upsert (update + insert)
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { 
        items: cartItems,
        updatedAt: Date.now()
      },
      { 
        new: true,
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    );
    
    console.log(`Cart updated successfully: ${cart._id}`);
    res.status(200).json(cart.items);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error updating cart', error: error.message });
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if there's enough in stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough items in stock' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        userId: req.user._id,
        items: [],
        subtotal: 0
      });
    }

    // Check if the product is already in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // If item exists, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity
      });
    }

    // Calculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Update the quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.id;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // Recalculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.subtotal = 0;
    
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  getUserCart,
  updateUserCart,
  clearUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 