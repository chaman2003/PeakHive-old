import React from 'react';
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import Wishlist from './pages/Wishlist';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import OrderDetailPage from './pages/OrderDetailPage';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import UserList from './pages/admin/UserList';
import UserEdit from './pages/admin/UserEdit';
import UserCreate from './pages/admin/UserCreate';
import ProductList from './pages/admin/ProductList';
import ProductCreate from './pages/admin/ProductCreate';
import OrderList from './pages/admin/OrderList';
import OrderDetail from './pages/admin/OrderDetail';
import ReviewList from './pages/admin/ReviewList';
import ProductEdit from './pages/admin/ProductEdit';
import ContactMessageList from './pages/admin/ContactMessageList';

// Define all routes in one place for better organization
const routes = [
  // Public routes
  { path: '/', element: <Home /> },
  { path: '/products', element: <Products /> },
  { path: '/products/:id', element: <ProductDetails /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/cart', element: <Cart /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/admin/login', element: <AdminLogin /> },
  
  // Protected routes - requires login
  { 
    path: '/profile', 
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/wishlist', 
    element: (
      <ProtectedRoute>
        <Wishlist />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/checkout', 
    element: (
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/orders', 
    element: (
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    ) 
  },
  
  // Admin routes - requires admin role
  {
    path: '/admin',
    element: <Navigate to="/admin/login" replace />
  },
  { 
    path: '/admin/dashboard', 
    element: (
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/users', 
    element: (
      <AdminRoute>
        <UserList />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/users/create', 
    element: (
      <AdminRoute>
        <UserCreate />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/users/edit/:id', 
    element: (
      <AdminRoute>
        <UserEdit />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/products', 
    element: (
      <AdminRoute>
        <ProductList />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/products/create', 
    element: (
      <AdminRoute>
        <ProductCreate />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/products/edit/:id', 
    element: (
      <AdminRoute>
        <ProductEdit />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/orders', 
    element: (
      <AdminRoute>
        <OrderList />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/orders/:id', 
    element: (
      <AdminRoute>
        <OrderDetail />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/reviews', 
    element: (
      <AdminRoute>
        <ReviewList />
      </AdminRoute>
    ) 
  },
  { 
    path: '/admin/messages', 
    element: (
      <AdminRoute>
        <ContactMessageList />
      </AdminRoute>
    ) 
  },
  { path: '/order/:id', element: <OrderDetailPage /> },
];

export default routes; 