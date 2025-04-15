import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from 'process';

// Configure environment variables
dotenv.config();

console.log('Mongoose version:', mongoose.version);
console.log('Environment variables loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');

// Test connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://root:123@peakhive.gjhdct3.mongodb.net/?retryWrites=true&w=majority&appName=peakhive')
  .then(() => {
    console.log('MongoDB Connected Successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }); 