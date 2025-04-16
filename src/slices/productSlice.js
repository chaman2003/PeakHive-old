import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/index';

// Async thunks for product actions
export const listProducts = createAsyncThunk(
  'product/list',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Destructure params with defaults
      const { 
        keyword = '', 
        page = 1, 
        category = '', 
        sort = '',
        minPrice,
        maxPrice
      } = params;
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      // Only append params with actual values
      if (keyword) queryParams.append('keyword', keyword);
      queryParams.append('page', page.toString());
      if (category && category !== 'all') queryParams.append('category', category);
      if (sort) queryParams.append('sort', sort);
      if (minPrice !== undefined && minPrice !== null && minPrice !== '') 
        queryParams.append('minPrice', minPrice.toString());
      if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') 
        queryParams.append('maxPrice', maxPrice.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `/products?${queryString}` : '/products';

      console.log('Fetching products with URL:', url);
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