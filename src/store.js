import { configureStore } from '@reduxjs/toolkit';

// Import slices
import userReducer from './slices/userSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import reviewReducer from './slices/reviewSlice';
import wishlistReducer from './slices/wishlistSlice';

// Get user from localStorage if it exists
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// Get cart items from localStorage if they exist
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

// Initial state
const initialState = {
  user: { 
    userInfo: userInfoFromStorage,
    userDetails: {},
  },
  cart: { cartItems: cartItemsFromStorage },
  order: {
    order: null,
    myOrders: [],
    loading: false,
    success: false,
    paymentSuccess: false,
    invoiceSuccess: false,
    invoice: null,
    error: null,
  },
  wishlist: {
    wishlistItems: [],
    loading: false,
    error: null,
    success: false,
  }
};

// Create store with Redux Toolkit
const store = configureStore({
  reducer: {
    user: userReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    review: reviewReducer,
    wishlist: wishlistReducer,
  },
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 