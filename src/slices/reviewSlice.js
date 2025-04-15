import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/index';

// Create a review
export const createReview = createAsyncThunk(
  'review/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/reviews', reviewData);
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

// Get product reviews
export const getProductReviews = createAsyncThunk(
  'review/getProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
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

// Initial state
const initialState = {
  reviews: [],
  loading: false,
  success: false,
  error: null,
};

// Review slice
const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    resetReviewState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get product reviews
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer; 