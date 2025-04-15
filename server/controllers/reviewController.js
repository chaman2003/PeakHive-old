import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, productName } = req.body;
    
    // Log the request data for debugging
    console.log('Review request body:', req.body);
    console.log('Authenticated user:', req.user?._id);

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create new review with both field sets to satisfy the indexes
    const review = new Review({
      user: req.user._id,
      userId: req.user._id, // Add this field for the index
      product: productId,
      productId: productId, // Add this field for the index
      productName: productName,
      rating: Number(rating),
      title,
      comment,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userImage: req.user.profileImage
    });

    const createdReview = await review.save();

    // Update product's average rating
    const allProductReviews = await Review.find({ product: productId });
    const totalRating = allProductReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allProductReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      numReviews: allProductReviews.length
    });

    res.status(201).json(createdReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('user', 'firstName lastName profileImage');

    res.json(reviews);
  } catch (error) {
    console.error('Error getting product reviews:', error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Admin
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const rating = req.query.rating || '';
    const search = req.query.search || '';
    const productId = req.query.productId || '';

    // Build filter object
    const filter = {};
    
    // Add rating filter if provided
    if (rating) {
      filter.rating = Number(rating);
    }
    
    // Add product filter if provided
    if (productId) {
      filter.product = productId;
    }
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limit);
    
    // Get reviews with pagination and filters
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email profileImage')
      .populate('product', 'name images');

    res.json({
      reviews,
      page,
      pages: totalPages,
      total: totalReviews
    });
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.remove();

    // Update product's average rating
    const productId = review.product;
    const allProductReviews = await Review.find({ product: productId });
    
    if (allProductReviews.length > 0) {
      const totalRating = allProductReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allProductReviews.length;
      
      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        numReviews: allProductReviews.length
      });
    } else {
      // If no reviews left, reset rating
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }

    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

export { createReview, getProductReviews, getAllReviews, deleteReview }; 