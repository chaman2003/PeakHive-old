// Import dependencies
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from 'process';
// Note: If colored console output is desired, you can import a package like 'colors' 
// and add it to your dependencies with: npm install colors

// Import models
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://root:123@peakhive.gjhdct3.mongodb.net/?retryWrites=true&w=majority&appName=peakhive');

// Function to display all data from MongoDB
const displayData = async () => {
  try {
    // Display all users
    const users = await User.find({}).select('-password');
    console.log(`Found ${users.length} users in database`);
    
    // Display all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products in database`);
    if (products.length > 0) {
      console.log('Product IDs:');
      products.forEach(product => {
        console.log(`- ${product._id}: ${product.name}`);
      });
    }
    
    // Display all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders in database`);
    
    // Display all reviews
    const reviews = await Review.find({});
    console.log(`Found ${reviews.length} reviews in database`);
    
    console.log('All data displayed successfully');
    process.exit();
  } catch (error) {
    console.error(`Error displaying data: ${error.message}`);
    process.exit(1);
  }
};

// Sample products data
const sampleProducts = [
  {
    name: 'Apple MacBook Pro 16"',
    price: 2399.99,
    description: 'The most powerful MacBook Pro ever is here. With the blazing-fast M1 Pro or M1 Max chip — the first Apple silicon designed for pros — you get groundbreaking performance and amazing battery life.',
    category: 'laptops',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000',
      'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?q=80&w=1000'
    ],
    stock: 50,
    specifications: [
      { name: 'Processor', value: 'Apple M1 Pro' },
      { name: 'RAM', value: '16GB' },
      { name: 'Storage', value: '512GB SSD' },
      { name: 'Display', value: '16" Liquid Retina XDR' },
      { name: 'Battery Life', value: 'Up to 21 hours' },
      { name: 'Operating System', value: 'macOS' }
    ],
    features: [
      'Stunning Liquid Retina XDR display',
      'M1 Pro chip for exceptional performance',
      'Up to 21 hours of battery life',
      'Studio-quality microphones',
      'Advanced camera with Center Stage'
    ],
    tags: ['apple', 'laptop', 'macbook', 'pro', 'computers'],
    discount: 5
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    price: 1199.99,
    description: 'The Samsung Galaxy S23 Ultra is the ultimate premium smartphone experience, with a stunning display, powerful performance, and an advanced camera system.',
    category: 'smartphones',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1678911820864-e5a2c7a379a3?q=80&w=1000',
      'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?q=80&w=1000',
      'https://images.unsplash.com/photo-1592950630581-03cb41003396?q=80&w=1000'
    ],
    stock: 75,
    specifications: [
      { name: 'Display', value: '6.8" Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { name: 'RAM', value: '12GB' },
      { name: 'Storage', value: '256GB' },
      { name: 'Main Camera', value: '200MP' },
      { name: 'Battery', value: '5000 mAh' },
      { name: 'Operating System', value: 'Android 13' }
    ],
    features: [
      '200MP main camera with advanced night mode',
      'S Pen included for notes and creative work',
      'Powerful gaming performance',
      'All-day battery life',
      'Water and dust resistant (IP68)'
    ],
    tags: ['samsung', 'smartphone', 'galaxy', 'android', 'mobile'],
    discount: 10
  },
  {
    name: 'Sony WH-1000XM5',
    price: 399.99,
    description: 'Industry-leading noise cancellation with the Sony WH-1000XM5 wireless headphones. Experience premium sound quality and crystal clear calls.',
    category: 'audio',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000',
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1000'
    ],
    stock: 100,
    specifications: [
      { name: 'Type', value: 'Over-ear' },
      { name: 'Connectivity', value: 'Bluetooth 5.2' },
      { name: 'Battery Life', value: 'Up to 30 hours' },
      { name: 'Noise Cancellation', value: 'Active Noise Cancellation' },
      { name: 'Water Resistance', value: 'None' }
    ],
    features: [
      'Industry-leading noise cancellation',
      'Premium sound quality with new drivers',
      'Crystal clear calls with 8 microphones',
      'Up to 30 hours of battery life',
      'Quick charging (3 hours of playback in 3 minutes)'
    ],
    tags: ['sony', 'headphones', 'audio', 'wireless', 'noise-cancelling'],
    discount: 15
  },
  {
    name: 'PlayStation 5 Digital Edition',
    price: 399.99,
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.',
    category: 'gaming',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1000',
      'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=1000',
      'https://images.unsplash.com/photo-1618257722339-73af2df8acfd?q=80&w=1000'
    ],
    stock: 25,
    specifications: [
      { name: 'Platform', value: 'PlayStation 5' },
      { name: 'Storage', value: '825GB SSD' },
      { name: 'Resolution', value: '4K' },
      { name: 'Frame Rate', value: 'Up to 120fps' },
      { name: 'Controllers', value: 'DualSense wireless controller' }
    ],
    features: [
      'Lightning-fast loading with ultra-high speed SSD',
      'Stunning 4K graphics',
      'Haptic feedback and adaptive triggers',
      'Tempest 3D AudioTech for immersive sound',
      'Ray tracing support for realistic lighting'
    ],
    tags: ['playstation', 'gaming', 'console', 'sony', 'ps5'],
    discount: 0
  },
  {
    name: 'Apple Watch Series 8',
    price: 399.99,
    description: 'Apple Watch Series 8 features advanced health sensors and apps, so you can take an ECG, measure heart rate and blood oxygen, and track temperature changes for advanced insights into your menstrual cycle.',
    category: 'wearables',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000',
      'https://images.unsplash.com/photo-1624096104992-9b4fa3a279dd?q=80&w=1000',
      'https://images.unsplash.com/photo-1434494817513-cc112a976e36?q=80&w=1000'
    ],
    stock: 60,
    specifications: [
      { name: 'Type', value: 'Smartwatch' },
      { name: 'Display', value: 'Retina LTPO OLED' },
      { name: 'Battery Life', value: 'Up to 18 hours' },
      { name: 'Water Resistance', value: '50 meters' },
      { name: 'Connectivity', value: 'GPS, Cellular, Bluetooth 5.0, WiFi' },
      { name: 'Compatibility', value: 'iOS only' }
    ],
    features: [
      'Advanced health monitoring (ECG, blood oxygen)',
      'Temperature sensing',
      'Crash detection',
      'Water resistant to 50 meters',
      'Always-On Retina display'
    ],
    tags: ['apple', 'smartwatch', 'wearable', 'fitness', 'health'],
    discount: 5
  },
  {
    name: 'Logitech MX Master 3S',
    price: 99.99,
    description: 'The Logitech MX Master 3S is an advanced wireless mouse with ultra-fast scrolling, ergonomic design, and precision tracking on any surface, including glass.',
    category: 'other',
    brand: 'Logitech',
    images: [
      'https://images.unsplash.com/photo-1588850699123-08d913867c07?q=80&w=1000',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1000',
      'https://images.unsplash.com/photo-1585789838776-f93506ae9356?q=80&w=1000'
    ],
    stock: 120,
    specifications: [
      { name: 'Type', value: 'Wireless mouse' },
      { name: 'Sensor', value: '8000 DPI' },
      { name: 'Buttons', value: '7 programmable buttons' },
      { name: 'Battery Life', value: 'Up to 70 days' },
      { name: 'Connectivity', value: 'Bluetooth and USB receiver' }
    ],
    features: [
      'Ultra-fast MagSpeed scrolling',
      'Tracks on any surface, including glass',
      'Ergonomic design for comfort',
      'Up to 70 days on a full charge',
      'USB-C quick charging'
    ],
    tags: ['logitech', 'mouse', 'accessory', 'productivity', 'ergonomic'],
    discount: 0
  }
];

// Add new products
const addProducts = async () => {
  try {
    // First remove existing products
    await Product.deleteMany({});
    console.log('Existing products removed');
    
    // Insert new products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Added ${createdProducts.length} new products to database`);
    
    // Show added products
    console.log('New products:');
    createdProducts.forEach(product => {
      console.log(`- ${product._id}: ${product.name} (${product.category})`);
    });
    
    console.log('Successfully added new products!');
    process.exit();
  } catch (error) {
    console.error(`Error adding products: ${error.message}`);
    process.exit(1);
  }
};

// Remove only products
const removeProducts = async () => {
  try {
    // First check how many products we have
    const beforeCount = await Product.countDocuments();
    console.log(`Found ${beforeCount} products before deletion`);

    // Delete all products
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} products`);
    
    // Verify deletion
    const afterCount = await Product.countDocuments();
    console.log(`Found ${afterCount} products after deletion`);
    
    if (afterCount === 0) {
      console.log('All products successfully removed from database!');
    } else {
      console.log('WARNING: Some products may still exist in the database!');
      
      // Show remaining products if any
      const remainingProducts = await Product.find({});
      remainingProducts.forEach(product => {
        console.log(`- Remaining product: ${product._id}: ${product.name}`);
      });
    }
    
    // Also check if there are any related product references in reviews
    const reviewsWithProducts = await Review.countDocuments({ productId: { $exists: true } });
    console.log(`Found ${reviewsWithProducts} reviews with product references`);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy all data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('All data removed from database!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run appropriate function based on command line arg
if (process.argv[2] === '-d') {
  destroyData();
} else if (process.argv[2] === '-p') {
  removeProducts();
} else if (process.argv[2] === '-a') {
  addProducts();
} else {
  displayData();
} 