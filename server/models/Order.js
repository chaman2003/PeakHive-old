import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true }
});

const PaymentResultSchema = new mongoose.Schema({
  id: { type: String },
  status: { type: String },
  update_time: { type: String },
  email_address: { type: String }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    // Remove unique constraint temporarily
    default: function() {
      const prefix = 'ORD-';
      const randomPart = Math.floor(1000000 + Math.random() * 9000000);
      const timestamp = Date.now().toString().slice(-6);
      return `${prefix}${randomPart}-${timestamp}`;
    }
  },
  orderItems: [OrderItemSchema],
  shippingAddress: AddressSchema,
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: PaymentResultSchema,
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  isCanceled: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date
  },
  canceledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate a unique order ID - improved version
OrderSchema.pre('save', function(next) {
  try {
    // Always set orderId for new documents, even if default was already applied
    if (this.isNew) {
      const prefix = 'ORD-';
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      this.orderId = `${prefix}${timestamp}-${random}`;
    }
    next();
  } catch (error) {
    console.error('Pre-save error:', error);
    // Force a value to avoid null
    this.orderId = `ORD-FALLBACK-${Date.now()}`;
    next();
  }
});

// Add this after creating your model to create a unique index if needed
const Order = mongoose.model('Order', OrderSchema);

// Create a unique index after a delay to ensure the pre-save hook works first
setTimeout(async () => {
  try {
    // Update any null orderIds in the database first
    await Order.updateMany(
      { orderId: null }, 
      { $set: { orderId: `ORD-FIXED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }}
    );
    
    // Now create the unique index
    await Order.collection.createIndex({ orderId: 1 }, { unique: true });
    console.log('Created unique index on orderId');
  } catch (err) {
    console.error('Error creating index:', err);
  }
}, 5000);

export default Order; 