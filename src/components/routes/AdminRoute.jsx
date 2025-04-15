import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * A wrapper component that redirects to admin login page if user is not authenticated or not an admin
 */
const AdminRoute = ({ children }) => {
  const location = useLocation();
  
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.user);

  // Debug log to help track issues
  console.log('AdminRoute - userInfo:', userInfo);

  // If no user is logged in
  if (!userInfo) {
    console.log('AdminRoute - No user logged in, redirecting to admin login');
    // Redirect to admin login page but save the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin or has the valid admin ID
  // Use the proper MongoDB ObjectId format matching what we set in the auth middleware
  if (userInfo.role !== 'admin' && 
      userInfo._id !== '000000000000000000000001' && 
      userInfo._id?.toString() !== '000000000000000000000001') {
    console.log('AdminRoute - User not admin, redirecting to admin login');
    // Redirect to admin login page with unauthorized message
    return <Navigate to="/admin/login" state={{ 
      unauthorized: true, 
      message: "You don't have permission to access admin area" 
    }} replace />;
  }

  // User is authenticated and is an admin, render the protected route
  console.log('AdminRoute - Admin access granted');
  return children;
};

export default AdminRoute; 