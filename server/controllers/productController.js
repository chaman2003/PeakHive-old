import Product from '../models/Product.js';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Review from '../models/Review.js';
import asyncHandler from 'express-async-handler';
import process from 'process';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // Extract request parameters with default values
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || 9999999;
    const sort = req.query.sort || '';
    
    // Log request parameters with clean values
    console.log('GET /api/products params:', {
      page,
      category: category || null,
      keyword: keyword || null,
      minPrice,
      maxPrice,
      sort: sort || null
    });
    
    // Filter options
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }
    
    filter.price = { $gte: minPrice, $lte: maxPrice };
    
    // Sorting options
    const sortOption = {};
    
    if (sort === 'price-low') {
      sortOption.price = 1;
    } else if (sort === 'price-high') {
      sortOption.price = -1;
    } else if (sort === 'rating') {
      sortOption.rating = -1;
    } else {
      // Default: newest first
      sortOption.createdAt = -1;
    }
    
    // Database operations with explicit try/catch blocks
    let count;
    try {
      count = await Product.countDocuments(filter);
      console.log(`Found ${count} products matching filter`);
    } catch (countError) {
      console.error('Error counting products:', countError);
      return res.status(500).json({ 
        message: 'Error counting products', 
        error: countError.message 
      });
    }
    
    let products;
    try {
      products = await Product.find(filter)
        .sort(sortOption)
        .limit(pageSize)
        .skip(pageSize * (page - 1));
      console.log(`Retrieved ${products.length} products for page ${page}`);
    } catch (findError) {
      console.error('Error finding products:', findError);
      return res.status(500).json({ 
        message: 'Error retrieving products', 
        error: findError.message 
      });
    }
    
    return res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count
    });
  } catch (error) {
    console.error('Unexpected error in getProducts:', error);
    return res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      brand,
      images,
      stock,
      specifications,
      features,
      tags,
      variants
    } = req.body;
    
    const product = new Product({
      name,
      price,
      description,
      category,
      brand,
      images: images || [], 
      stock,
      specifications: specifications || [],
      features: features || [],
      tags: tags || [],
      variants: variants || []
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      brand,
      images,
      stock,
      specifications,
      features,
      tags,
      variants
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.images = images || product.images;
      product.stock = stock !== undefined ? stock : product.stock;
      product.specifications = specifications || product.specifications;
      product.features = features || product.features;
      product.tags = tags || product.tags;
      product.variants = variants || product.variants;
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Begin a transaction or session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Remove the product from all carts
      await Cart.updateMany(
        { 'items.product': productId },
        { $pull: { items: { product: productId } } },
        { session }
      );
      console.log(`Removed product ${productId} from all carts`);
      
      // 2. Remove the product from all wishlists
      await Wishlist.updateMany(
        { productIds: productId },
        { $pull: { productIds: productId } },
        { session }
      );
      console.log(`Removed product ${productId} from all wishlists`);
      
      // 3. Remove all reviews for this product
      await Review.deleteMany({ product: productId }, { session });
      console.log(`Removed all reviews for product ${productId}`);
      
      // 4. Finally, delete the product itself
      await Product.deleteOne({ _id: productId }, { session });
      console.log(`Deleted product ${productId}`);
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      res.json({ 
        message: 'Product removed successfully',
        productId,
        productName: product.name,
        cleanup: 'Complete - removed from carts, wishlists and reviews'
      });
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Server Error deleting product', 
      error: error.message 
    });
  }
};

// @desc    Get product count for dashboard
// @route   GET /api/products/count
// @access  Private/Admin
const getProductCount = async (req, res) => {
  try {
    // Get total count of products directly from MongoDB
    const count = await Product.countDocuments();
    
    console.log(`Total products in database: ${count}`);
    res.json({ totalProducts: count });
  } catch (error) {
    console.error('Error getting product count:', error);
    res.status(500).json({ message: 'Failed to get product count' });
  }
};

/**
 * @desc    Create multiple products from bulk upload
 * @route   POST /api/products/bulk
 * @access  Private/Admin
 */
const bulkCreateProducts = asyncHandler(async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('No valid products data provided');
  }

  console.log(`[INFO] Attempting to create ${products.length} products in bulk`);
  
  try {
    // Validate all products before insertion
    const invalidProducts = products.filter(product => 
      !product.name || !product.price || !product.category);

    if (invalidProducts.length > 0) {
      res.status(400);
      throw new Error(`${invalidProducts.length} products are missing required fields (name, price, category)`);
    }

    // Prepare products for insertion with default values for missing fields
    const productsToInsert = products.map(product => ({
      user: req.user._id,
      name: product.name,
      price: product.price,
      description: product.description || 'No description provided',
      images: product.images || [],
      brand: product.brand || 'Generic',
      category: product.category,
      countInStock: product.countInStock || 0,
      numReviews: 0,
      rating: 0,
      featured: product.featured || false,
      isPublished: product.isPublished || true
    }));

    // Use insertMany for bulk insertion
    const createdProducts = await Product.insertMany(productsToInsert);
    
    console.log(`[INFO] Successfully created ${createdProducts.length} products in bulk`);
    res.status(201).json({
      success: true,
      count: createdProducts.length,
      products: createdProducts
    });
    
  } catch (error) {
    console.error(`[ERROR] Bulk product creation failed: ${error.message}`);
    res.status(500);
    throw new Error(`Failed to create products in bulk: ${error.message}`);
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
  bulkCreateProducts
}; 