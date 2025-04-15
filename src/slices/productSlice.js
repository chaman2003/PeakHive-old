import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/index';

// Async thunks for product actions
export const listProducts = createAsyncThunk(
  'product/list',
  async ({ keyword = '', page = 1, category = '', sort = '' }, { rejectWithValue }) => {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (page) params.append('page', page);
      if (category && category !== 'all') params.append('category', category);
      if (sort) params.append('sort', sort);

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';

      const { data } = await api.get(url);
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

export const getProductDetails = createAsyncThunk(
  'product/getDetails',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Fetching product with ID:', id);
      const { data } = await api.get(`/products/${id}`);
      console.log('Product API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
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
  productList: { products: [], pages: 0, page: 0 },
  productDetails: {},
  loading: false,
  error: null,
};

// Product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetProductDetails: (state) => {
      state.productDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // List products
      .addCase(listProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.productList.products = action.payload.products;
        state.productList.pages = action.payload.pages;
        state.productList.page = action.payload.page;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get product details
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProductDetails } = productSlice.actions;

export default productSlice.reducer; 