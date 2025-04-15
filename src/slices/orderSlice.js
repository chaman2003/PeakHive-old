import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/index';
import { clearCart } from './cartSlice';

// Create order
export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders', orderData);
      
      // Clear cart from localStorage
      localStorage.removeItem('cartItems');
      
      // Also clear cart from database if logged in
      try {
        await api.delete('/cart');
      } catch (cartError) {
        console.error('Error clearing cart from database:', cartError);
        // Continue with order creation even if cart clearing fails
      }
      
      // Dispatch action to clear cart in redux state
      dispatch(clearCart());
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  'order/details',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Process payment
export const processPayment = createAsyncThunk(
  'order/pay',
  async ({ orderId, paymentDetails }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/pay`, paymentDetails);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get my orders
export const getMyOrders = createAsyncThunk(
  'order/myOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string for any parameters
      let queryString = '';
      if (params && typeof params === 'object') {
        const queryParams = new URLSearchParams();
        // Add each parameter to the query string
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value);
        });
        queryString = queryParams.toString();
        if (queryString) {
          queryString = `?${queryString}`;
        }
      }
      
      const { data } = await api.get(`/orders/myorders${queryString}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Generate invoice (simulated for demo)
export const generateInvoice = createAsyncThunk(
  'order/invoice',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      // In a real app, you would call an API endpoint to generate a PDF
      // For this demo, we'll simulate by returning the order details
      const { order } = getState().order;
      
      // Simulate PDF generation
      return {
        ...order,
        invoiceGenerated: true,
        invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceDate: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue('Failed to generate invoice');
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'order/cancel',
  async (cancelData, { rejectWithValue }) => {
    try {
      // If cancelData is just an orderId string (backward compatibility)
      const orderId = typeof cancelData === 'string' ? cancelData : cancelData.orderId;
      
      // Handle as object with refund request if needed
      const requestData = typeof cancelData === 'object' 
        ? { requestRefund: cancelData.requestRefund } 
        : {};
      
      console.log(`Cancelling order ${orderId} with data:`, requestData);
      
      // Send the cancellation request with refund info if available
      const { data } = await api.put(`/orders/${orderId}/cancel`, requestData);
      return data;
    } catch (error) {
      // Enhanced error handling
      const errorMessage = 
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to cancel order';
      console.error('Error canceling order:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  'order/delete',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/orders/${orderId}`);
      return { message: data.message, orderId };
    } catch (error) {
      const errorMessage = 
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to delete order';
      console.error('Error deleting order:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Refund order
export const refundOrder = createAsyncThunk(
  'order/refund',
  async (refundData, { rejectWithValue }) => {
    try {
      const { orderId, reason, notes } = refundData;
      
      console.log(`Refunding order ${orderId} with reason: ${reason}`);
      
      const { data } = await api.put(`/orders/${orderId}/refund`, { reason, notes });
      return data;
    } catch (error) {
      const errorMessage = 
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message || 'Failed to refund order';
      console.error('Error refunding order:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState = {
  order: null,
  myOrders: [],
  loading: false,
  success: false,
  paymentSuccess: false,
  invoiceSuccess: false,
  cancelSuccess: false,
  deleteSuccess: false,
  refundSuccess: false,
  invoice: null,
  error: null,
};

// Order slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderSuccess: (state) => {
      state.success = false;
    },
    resetPaymentSuccess: (state) => {
      state.paymentSuccess = false;
    },
    resetInvoiceSuccess: (state) => {
      state.invoiceSuccess = false;
    },
    resetCancelSuccess: (state) => {
      state.cancelSuccess = false;
    },
    resetDeleteSuccess: (state) => {
      state.deleteSuccess = false;
    },
    resetRefundSuccess: (state) => {
      state.refundSuccess = false;
    },
    resetLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentSuccess = true;
        state.order = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure myOrders is always an array
        state.myOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoiceSuccess = true;
        state.invoice = action.payload;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelSuccess = true;
        // Update the order in myOrders array
        state.myOrders = state.myOrders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
        // Update current order if it matches
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        // Remove the deleted order from myOrders array
        state.myOrders = state.myOrders.filter(order => 
          order._id !== action.payload.orderId
        );
        // Reset current order if it matches
        if (state.order && state.order._id === action.payload.orderId) {
          state.order = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Refund order
      .addCase(refundOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.refundSuccess = true;
        // Update the order in myOrders array
        state.myOrders = state.myOrders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
        // Update current order if it matches
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  resetOrderSuccess, 
  resetPaymentSuccess, 
  resetInvoiceSuccess, 
  resetCancelSuccess, 
  resetDeleteSuccess,
  resetRefundSuccess,
  resetLoading 
} = orderSlice.actions;

export default orderSlice.reducer; 