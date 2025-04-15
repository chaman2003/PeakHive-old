import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'admin/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const [usersResponse, productsResponse, ordersResponse, revenueResponse] = await Promise.all([
        api.get('/users'),
        api.get('/products'),
        api.get('/orders'),
        api.get('/orders/stats')
      ]);

      return {
        users: usersResponse.data,
        products: productsResponse.data,
        orders: ordersResponse.data,
        revenue: revenueResponse.data.totalRevenue || 0,
        totalUsers: usersResponse.data.length,
        totalProducts: productsResponse.data.length,
        totalOrders: ordersResponse.data.length,
        ordersByStatus: revenueResponse.data.ordersByStatus || [],
        recentOrders: revenueResponse.data.recentOrders || []
      };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Initial state
const initialState = {
  dashboardData: {
    users: [],
    products: [],
    orders: [],
    revenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    ordersByStatus: [],
    recentOrders: []
  },
  loading: false,
  error: null
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: () => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer; 