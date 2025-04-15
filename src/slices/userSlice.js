import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Get the tab-specific session ID
const getTabSessionId = () => {
  // If we don't have a tabSessionId yet, create one
  if (!window.sessionStorage.getItem('tabSessionId')) {
    const newTabId = 'tab_' + Math.random().toString(36).substring(2, 15);
    window.sessionStorage.setItem('tabSessionId', newTabId);
  }
  return window.sessionStorage.getItem('tabSessionId') || 'default_tab';
};

// Get user from session storage or localStorage
const getUserInfo = () => {
  const tabSessionId = getTabSessionId();
  
  // Try to get from session storage first (tab-specific)
  let userInfo = window.sessionStorage.getItem(`userInfo_${tabSessionId}`);
  
  // If not in session storage, try localStorage (shared between tabs)
  if (!userInfo) {
    userInfo = localStorage.getItem('userInfo');
    // If found in localStorage, also store in session for this tab
    if (userInfo) {
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, userInfo);
    }
  }
  
  return userInfo ? JSON.parse(userInfo) : null;
};

// Register user
export const register = createAsyncThunk(
  'users/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/register', { name, email, password });
      
      const tabSessionId = getTabSessionId();
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(data));
      
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

// Login user
export const login = createAsyncThunk(
  'users/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/login', { email, password });
      
      const tabSessionId = getTabSessionId();
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(data));
      
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

// Logout user
export const logout = createAsyncThunk('users/logout', async () => {
  const tabSessionId = getTabSessionId();
  // Remove from this tab's session storage
  window.sessionStorage.removeItem(`userInfo_${tabSessionId}`);
  // Remove from localStorage (shared across tabs)
  localStorage.removeItem('userInfo');
  // Redirect to login page
  window.location.href = '/login';
  return null;
});

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'users/profile/update',
  async (user, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/profile', user);
      
      // Update the user info in session and local storage
      const tabSessionId = getTabSessionId();
      const userInfo = getUserInfo();
      
      const updatedUserInfo = { ...userInfo, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(updatedUserInfo));
      
      return updatedUserInfo;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get user details
export const getUserDetails = createAsyncThunk(
  'users/details',
  async (id, { rejectWithValue }) => {
    try {
      // If 'profile', get the current user's profile, otherwise get user by ID
      const endpoint = id === 'profile' ? '/users/profile' : `/users/${id}`;
      const { data } = await api.get(endpoint);
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

// Update user (admin only)
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${userId}`, userData);
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

// Get users (admin only)
export const getUsers = createAsyncThunk(
  'users/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users');
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

// Delete user (admin only)
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Add user address
export const addUserAddress = createAsyncThunk(
  'users/address/add',
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/address', addressData);
      
      // Update the user info in session and local storage
      const tabSessionId = getTabSessionId();
      const userInfo = getUserInfo();
      
      // Add new address to user info
      const updatedUserInfo = { 
        ...userInfo, 
        addresses: [...(userInfo.addresses || []), data] 
      };
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(updatedUserInfo));
      
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

// Delete user address
export const deleteUserAddress = createAsyncThunk(
  'users/address/delete',
  async (addressId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/users/address/${addressId}`);
      
      // Update the user info in session and local storage
      const tabSessionId = getTabSessionId();
      const userInfo = getUserInfo();
      
      // Remove the deleted address from user info
      const updatedUserInfo = {
        ...userInfo,
        addresses: (userInfo.addresses || []).filter(
          address => address._id !== addressId
        )
      };
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(updatedUserInfo));
      
      return { addressId, message: data.message };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update user address
export const updateUserAddress = createAsyncThunk(
  'users/address/update',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/address/${addressId}`, addressData);
      
      // Update the user info in session and local storage
      const tabSessionId = getTabSessionId();
      const userInfo = getUserInfo();
      
      // Update the address in the user info
      const updatedUserInfo = {
        ...userInfo,
        addresses: (userInfo.addresses || []).map(address => 
          address._id === addressId ? data : address
        )
      };
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(updatedUserInfo));
      
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

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: getUserInfo(),
    users: [],
    userDetails: null,
    loading: false,
    error: null,
    success: false,
    addressSuccess: false,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = false;
    },
    resetAddressSuccess: (state) => {
      state.addressSuccess = false;
    },
    // Add this to allow setting user info directly (for multi-tab support)
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      if (action.payload) {
        const tabSessionId = getTabSessionId();
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
        window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(action.payload));
      } else {
        const tabSessionId = getTabSessionId();
        window.sessionStorage.removeItem(`userInfo_${tabSessionId}`);
        localStorage.removeItem('userInfo');
      }
    },
    // Add a sync action to check and synchronize user state across tabs
    syncTabUserState: (state) => {
      const tabSessionId = getTabSessionId();
      const localStorageUser = localStorage.getItem('userInfo') 
        ? JSON.parse(localStorage.getItem('userInfo')) 
        : null;
      const sessionStorageUser = window.sessionStorage.getItem(`userInfo_${tabSessionId}`)
        ? JSON.parse(window.sessionStorage.getItem(`userInfo_${tabSessionId}`))
        : null;
        
      // If localStorage has a user but this tab doesn't, sync from localStorage
      if (localStorageUser && !sessionStorageUser) {
        window.sessionStorage.setItem(`userInfo_${tabSessionId}`, JSON.stringify(localStorageUser));
        state.userInfo = localStorageUser;
      }
      // If this tab has a user but localStorage doesn't, sync to localStorage
      else if (sessionStorageUser && !localStorageUser) {
        localStorage.setItem('userInfo', JSON.stringify(sessionStorageUser));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.success = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
        state.userDetails = null;
        state.users = [];
      })
      // Update user profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get user details cases
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all users cases
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user cases
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add user address cases
      .addCase(addUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.addressSuccess = false;
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addressSuccess = true;
        // Update userInfo if it exists
        if (state.userInfo) {
          state.userInfo.addresses = [...(state.userInfo.addresses || []), action.payload];
        }
      })
      .addCase(addUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user address cases
      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.addressSuccess = false;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addressSuccess = true;
        // Update userInfo if it exists
        if (state.userInfo && state.userInfo.addresses) {
          state.userInfo.addresses = state.userInfo.addresses.filter(
            address => address._id !== action.payload.addressId
          );
        }
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user address cases
      .addCase(updateUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.addressSuccess = false;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addressSuccess = true;
        // Update userInfo if it exists
        if (state.userInfo && state.userInfo.addresses) {
          state.userInfo.addresses = state.userInfo.addresses.map(address => 
            address._id === action.payload._id ? action.payload : address
          );
        }
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearUserError, 
  clearUserSuccess, 
  setUserInfo, 
  syncTabUserState,
  resetAddressSuccess 
} = userSlice.actions;

export default userSlice.reducer; 