import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    default: 'https://randomuser.me/api/portraits/lego/1.jpg'
  }
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate reviews from same user for same product
// Only apply the index if both fields are not null
ReviewSchema.index({ 
  userId: 1, 
  productId: 1 
}, { 
  unique: true,
  partialFilterExpression: { 
    userId: { $ne: null },
    productId: { $ne: null }
  } 
});

// Index to support queries by user and product
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ product: 1 });

// Add a pre-save hook to validate that both user and product exist
ReviewSchema.pre('save', function(next) {
  if (!this.user || !this.product) {
    next(new Error('Both user and product are required for a review'));
  } else {
    next();
  }
});

const Review = mongoose.model('Review', ReviewSchema);

export default Review; 