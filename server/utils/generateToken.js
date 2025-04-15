import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import process from 'process';

// Configure environment variables
dotenv.config();

// Generate JWT token
const generateToken = (id) => {
  // Convert id to string to ensure it's compatible with jwt signing
  const idString = String(id);
  
  return jwt.sign({ id: idString }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export default generateToken; 