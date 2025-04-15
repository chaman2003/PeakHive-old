import mongoose from 'mongoose';

const SpecificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
});

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [String]
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['laptops', 'smartphones', 'audio', 'gaming', 'wearables', 'other']
  },
  brand: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  specifications: [SpecificationSchema],
  features: [String],
  tags: [String],
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  variants: [VariantSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', ProductSchema);

export default Product; 