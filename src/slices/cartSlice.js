import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/index';

// Async thunks for cart actions
export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity, name, price, image, stock }, { getState, dispatch, rejectWithValue }) => {
    try {
      // If all product data is provided in the payload, use it directly
      if (productId && name && price !== undefined && image && stock !== undefined) {
        const item = {
          productId,
          name,
          image,
          price,
          stock,
          quantity,
        };
        
        const { cart } = getState();
        
        // Check if item already exists in cart
        const existingItem = cart.cartItems.find(x => x.productId === productId);
        
        let updatedCartItems;
        if (existingItem) {
          // If exists, update quantity
          updatedCartItems = cart.cartItems.map(item => 
            item.productId === productId ? { ...item, quantity } : item
          );
        } else {
          // If doesn't exist, add new item
          updatedCartItems = [...cart.cartItems, item];
        }
        
        // Save to localStorage
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        
        // Add this at the end to save to database
        const { userInfo } = getState().user;
        if (userInfo) {
          dispatch(syncCartWithDatabase());
        }
        
        return item;
      }
      
      // If product data is not provided in payload, fetch from API
      const { data } = await api.get(`/products/${productId}`);
      
      const item = {
        productId: data._id,
        name: data.name,
        image: data.images[0],
        price: data.price,
        stock: data.stock,
        quantity,
      };
      
      const { cart } = getState();
      
      // Check if item already exists in cart
      const existingItem = cart.cartItems.find(x => x.productId === productId);
      
      let updatedCartItems;
      if (existingItem) {
        // If exists, update quantity
        updatedCartItems = cart.cartItems.map(item => 
          item.productId === productId ? { ...item, quantity } : item
        );
      } else {
        // If doesn't exist, add new item
        updatedCartItems = [...cart.cartItems, item];
      }
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      
      // Add this at the end to save to database
      const { userInfo } = getState().user;
      if (userInfo) {
        dispatch(syncCartWithDatabase());
      }
      
      return item;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Add this new thunk to save cart to database
export const syncCartWithDatabase = createAsyncThunk(
  'cart/syncWithDatabase',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      const { userInfo } = getState().user;
      
      // Only sync with database if user is logged in
      if (!userInfo) {
        console.log('User not logged in, skipping cart sync');
        return cart.cartItems;
      }
      
      console.log('Syncing cart with database:', cart.cartItems.length, 'items');
      const response = await api.post('/cart', { cartItems: cart.cartItems });
      console.log('Cart synced successfully');
      return response.data;
    } catch (error) {
      console.error('Error syncing cart with database:', error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Add this thunk to load cart from database
export const loadCartFromDatabase = createAsyncThunk(
  'cart/loadFromDatabase',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().user;
      
      // Only load from database if user is logged in
      if (!userInfo) {
        console.log('User not logged in, skipping cart load');
        return [];
      }
      
      console.log('Loading cart from database');
      const response = await api.get('/cart');
      console.log('Cart loaded successfully:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('Error loading cart from database:', error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Add a new thunk to clear cart with server sync
export const clearCartWithServer = createAsyncThunk(
  'cart/clearWithServer',
  async (_, { rejectWithValue }) => {
    try {
      // Clear cart on server if user is logged in
      await api.delete('/cart');
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart on server:', error);
      // Return error so the component can handle it
      return rejectWithValue(error.message || 'Failed to clear cart on server');
    }
  }
);

// Initial state
const initialState = {
  cartItems: [],
  loading: false,
  error: null,
  couponCode: '',
  discount: 0,
  shipping: 0,
};

// Helper function to calculate shipping
const calculateShipping = (cartItems) => {
  // Always apply standard shipping charge of $10
  return cartItems.length > 0 ? 10 : 0; // Only apply if there are items in cart
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.cartItems.findIndex(
        (item) => item.productId === productId
      );
      
      if (itemIndex >= 0) {
        state.cartItems[itemIndex].quantity = quantity;
        // Update shipping whenever cart quantity changes
        state.shipping = calculateShipping(state.cartItems);
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        localStorage.setItem('shipping', state.shipping.toString());
      }
    },
    applyCouponCode: (state, action) => {
      const couponCode = action.payload;
      state.couponCode = couponCode;
      
      // Apply discount based on the coupon code
      if (couponCode === 'discount50') {
        state.discount = 0.5; // 50% discount
      } else {
        state.discount = 0;
      }
      
      // Save coupon and discount to localStorage
      localStorage.setItem('couponCode', couponCode);
      localStorage.setItem('discount', state.discount.toString());
    },
    clearCouponCode: (state) => {
      state.couponCode = '';
      state.discount = 0;
      localStorage.removeItem('couponCode');
      localStorage.removeItem('discount');
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.couponCode = '';
      state.discount = 0;
      state.shipping = 0;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('couponCode');
      localStorage.removeItem('discount');
      localStorage.removeItem('shipping');
      // This ensures we're explicitly clearing all cart-related state
      state.itemCount = 0;
      state.cartTotal = 0;
      state.loading = false;
      state.error = null;
    },
    // Add this reducer to update shipping separately
    updateShipping: (state) => {
      state.shipping = calculateShipping(state.cartItems);
      localStorage.setItem('shipping', state.shipping.toString());
    },
  },
  extraReducers: (builder) => {
    builder
      // Add cases for your new thunks
      .addCase(syncCartWithDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartWithDatabase.fulfilled, (state, action) => {
        state.loading = false;
        // We don't need to update cartItems here because we're just syncing
      })
      .addCase(syncCartWithDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadCartFromDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCartFromDatabase.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        // Also update localStorage
        localStorage.setItem('cartItems', JSON.stringify(action.payload));
      })
      .addCase(loadCartFromDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        
        const itemExists = state.cartItems.find(
          (item) => item.productId === action.payload.productId
        );
        
        if (itemExists) {
          state.cartItems = state.cartItems.map((item) =>
            item.productId === action.payload.productId ? action.payload : item
          );
        } else {
          state.cartItems.push(action.payload);
        }
        
        // Update shipping whenever cart changes
        state.shipping = calculateShipping(state.cartItems);
        localStorage.setItem('shipping', state.shipping.toString());
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add handlers for the new clearCartWithServer action
      .addCase(clearCartWithServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartWithServer.fulfilled, (state) => {
        state.cartItems = [];
        state.itemCount = 0;
        state.cartTotal = 0;
        state.loading = false;
        localStorage.removeItem('cartItems');
      })
      .addCase(clearCartWithServer.rejected, (state, action) => {
        // Still clear the cart locally even if server sync fails
        state.cartItems = [];
        state.itemCount = 0;
        state.cartTotal = 0;
        state.loading = false;
        state.error = action.payload;
        localStorage.removeItem('cartItems');
      })
      // Load cart from localStorage (on app initialize)
      .addCase('cart/loadFromLocalStorage', (state) => {
        try {
          // Load cart items
          const cartItems = localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [];
          
          // Load coupon code and discount
          const couponCode = localStorage.getItem('couponCode') || '';
          const discount = localStorage.getItem('discount') 
            ? parseFloat(localStorage.getItem('discount')) 
            : 0;
          
          // Load shipping or calculate if not available
          let shipping = localStorage.getItem('shipping')
            ? parseFloat(localStorage.getItem('shipping'))
            : null;
            
          // If shipping isn't in localStorage, calculate it
          if (shipping === null) {
            shipping = calculateShipping(cartItems);
            localStorage.setItem('shipping', shipping.toString());
          }
          
          state.cartItems = cartItems;
          state.couponCode = couponCode;
          state.discount = discount;
          state.shipping = shipping;
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          // Reset to defaults if there's an error
          state.cartItems = [];
          state.couponCode = '';
          state.discount = 0;
          state.shipping = 0;
        }
      });
  },
});

export const { 
  removeFromCart, 
  updateCartQuantity, 
  clearCart,
  applyCouponCode,
  clearCouponCode,
  updateShipping
} = cartSlice.actions;

export default cartSlice.reducer; 