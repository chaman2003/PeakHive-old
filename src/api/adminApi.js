import api from './index';

// Fetch dashboard statistics
export const fetchDashboardStats = async () => {
  try {
    // Add a cache-busting parameter
    const timestamp = new Date().getTime();
    
    const [usersResponse, productsResponse, productCountResponse, ordersResponse, statsResponse] = await Promise.all([
      api.get(`/users?_=${timestamp}`),
      api.get(`/products?_=${timestamp}`),
      api.get(`/products/count?_=${timestamp}`),
      api.get(`/orders?_=${timestamp}`),
      api.get(`/orders/stats?_=${timestamp}`)
    ]);

    // Check the structure of usersResponse.data and determine if it's the users array or contains a 'users' property
    const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data.users || []);
    
    // Extract stats data from the MongoDB collections
    const totalUsers = usersResponse.data.total || usersData.length || 0;
    
    // Get product count directly from MongoDB through the dedicated endpoint
    const totalProducts = productCountResponse.data.totalProducts || 0;
    
    // Get total orders and revenue from the stats endpoint
    const totalOrders = statsResponse.data.totalOrders || 0;
    const totalRevenue = statsResponse.data.totalRevenue || 0;
    
    console.log("Revenue from MongoDB:", totalRevenue);

    // Get the most recent users and orders for display
    const users = usersData.slice(0, 5);
    const orders = ordersResponse.data.orders ? ordersResponse.data.orders.slice(0, 5) : [];

    return {
      users,
      products: productsResponse.data,
      orders,
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: totalRevenue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Fetch all users with pagination
export const fetchUsers = async (page = 1, limit = 10, searchTerm = '') => {
  try {
    let url = `/users?page=${page}&limit=${limit}`;
    
    // Add search parameter if provided
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch all products with pagination
export const fetchProducts = async (page = 1, limit = 10, searchTerm = '', category = '') => {
  try {
    const params = new URLSearchParams();
    
    // Always include page and limit
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Only add other parameters if they have values
    if (searchTerm) {
      params.append('keyword', encodeURIComponent(searchTerm));
    }
    
    if (category && category !== 'all') {
      params.append('category', encodeURIComponent(category));
    }
    
    const url = `/products?${params.toString()}`;
    console.log('Admin API fetching products with URL:', url);
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Fetch all orders with pagination
export const fetchOrders = async (page = 1, limit = 10, searchTerm = '', status = '') => {
  try {
    let url = `/orders?page=${page}&limit=${limit}`;
    
    // Add search term if provided
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    // Add status filter if provided
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch all payments with pagination
export const fetchPayments = async (page = 1, limit = 10, searchTerm = '', paymentMethod = '') => {
  try {
    let url = `/payment/admin/list?page=${page}&limit=${limit}`;
    
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    if (paymentMethod) {
      url += `&paymentMethod=${encodeURIComponent(paymentMethod)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await api.get('/products/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch all reviews with pagination
export const fetchReviews = async (page = 1, limit = 10, rating = '', searchTerm = '', productId = '') => {
  try {
    let url = `/reviews?page=${page}&limit=${limit}`;
    
    if (rating) {
      url += `&rating=${rating}`;
    }
    
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    if (productId) {
      url += `&productId=${encodeURIComponent(productId)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await api.put(`/orders/${orderId}`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user with data:', userData);
    // Log phone number specifically for debugging
    if (userData.phone) {
      console.log('Phone number being updated:', userData.phone);
    }
    const response = await api.put(`/users/${userId}`, userData);
    console.log('User update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    // Extract detailed error message from response if available
    const errorMsg = error.response?.data?.message || 'Failed to update user';
    throw new Error(errorMsg);
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    // Extract detailed error message from response if available
    const errorMsg = error.response?.data?.message || 'Failed to delete user';
    throw new Error(errorMsg);
  }
};

// Fetch a single user by ID
export const fetchUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Fetch a single product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Fetch a single order by ID
export const fetchOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

// Register a new user (admin only)
export const register = async (userData) => {
  try {
    console.log('Registering new user with data:', {
      ...userData,
      password: userData.password ? '********' : undefined // Hide password in logs
    });
    // Log phone number specifically for debugging
    if (userData.phone) {
      console.log('Phone number being registered:', userData.phone);
    }
    const response = await api.post('/users', userData);
    console.log('User registration successful:', response.data._id);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    // Extract detailed error message from response if available
    const errorMsg = error.response?.data?.message || 'Failed to register user';
    throw new Error(errorMsg);
  }
};

// Fetch all contact messages with pagination
export const fetchContactMessages = async (page = 1, limit = 10, status = '') => {
  try {
    let url = `/contact?page=${page}&limit=${limit}`;
    
    // Add status filter if provided
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    throw error;
  }
};

// Fetch a single contact message by ID
export const fetchContactMessageById = async (messageId) => {
  try {
    const response = await api.get(`/contact/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact message by ID:', error);
    throw error;
  }
};

// Update contact message status
export const updateContactMessage = async (messageId, statusData) => {
  try {
    const response = await api.put(`/contact/${messageId}`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating contact message:', error);
    throw error;
  }
};

// Delete a contact message
export const deleteContactMessage = async (messageId) => {
  try {
    const response = await api.delete(`/contact/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contact message:', error);
    throw error;
  }
};

// Create products in bulk
export const createProductsBulk = async (productsData) => {
  try {
    const response = await api.post('/products/bulk', { products: productsData });
    return response.data;
  } catch (error) {
    console.error('Error creating products in bulk:', error);
    throw error;
  }
}; 