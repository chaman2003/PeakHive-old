import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingBag, FaListAlt, FaDollarSign, FaSync, FaChartLine, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { fetchDashboardStats } from '../../api/adminApi';
import { fadeInUp, staggerContainer } from '../../utils/animationVariants';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      
      console.log("Retrieved dashboard data:", data);
      
      setStats({
        totalUsers: data.totalUsers || 0,
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        revenue: data.revenue || 0
      });
      
      setUsers(data.users || []);
      setOrders(data.orders || []);
      setLoading(false);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up interval for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Handle manual refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'processing':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      case 'pending':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  };

  // Prepare data for pie chart
  const pieData = {
    labels: ['Products', 'Users', 'Orders'],
    datasets: [
      {
        label: 'Dashboard Statistics',
        data: [stats.totalProducts, stats.totalUsers, stats.totalOrders],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for line chart (in a real app, this would come from API)
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [stats.revenue * 0.7, stats.revenue * 0.5, stats.revenue * 0.8, stats.revenue * 0.6, stats.revenue * 0.9, stats.revenue],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: [stats.totalOrders * 0.6, stats.totalOrders * 0.4, stats.totalOrders * 0.7, stats.totalOrders * 0.5, stats.totalOrders * 0.8, stats.totalOrders],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Mock data for bar chart (in a real app, this would come from API)
  const barData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Orders This Week',
        data: [
          Math.round(stats.totalOrders * 0.10), 
          Math.round(stats.totalOrders * 0.15), 
          Math.round(stats.totalOrders * 0.17), 
          Math.round(stats.totalOrders * 0.22), 
          Math.round(stats.totalOrders * 0.19), 
          Math.round(stats.totalOrders * 0.25), 
          Math.round(stats.totalOrders * 0.12)
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h1 className="mt-4">Dashboard</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Dashboard Overview</li>
          </ol>
        </div>
        <button 
          className="btn btn-outline-primary" 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
        >
          <FaSync className={refreshing ? "spinner me-2" : "me-2"} />
          Refresh Stats
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="row"
          >
            <motion.div variants={fadeInUp} className="col-xl-3 col-md-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="card bg-primary text-white mb-4 shadow-sm"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="h2">{stats.totalOrders}</div>
                      <div className="text-white-50">Total Orders</div>
                    </div>
                    <FaListAlt className="text-white-50" size={36} />
                  </div>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/admin/orders">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="col-xl-3 col-md-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="card bg-success text-white mb-4 shadow-sm"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="h2">{stats.totalProducts}</div>
                      <div className="text-white-50">Total Products</div>
                    </div>
                    <FaShoppingBag className="text-white-50" size={36} />
                  </div>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/admin/products">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="col-xl-3 col-md-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="card bg-info text-white mb-4 shadow-sm"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="h2">{stats.totalUsers}</div>
                      <div className="text-white-50">Total Users</div>
                    </div>
                    <FaUsers className="text-white-50" size={36} />
                  </div>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/admin/users">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="col-xl-3 col-md-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="card bg-warning text-white mb-4 shadow-sm"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="h2">{formatCurrency(stats.revenue)}</div>
                      <div className="text-white-50">Total Revenue</div>
                    </div>
                    <FaDollarSign className="text-white-50" size={36} />
                  </div>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/admin/orders">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Charts Row */}
          <div className="row mb-4">
            <div className="col-xl-8 col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <FaChartLine className="me-2 text-primary" />
                    Revenue & Orders Trend
                  </h5>
                  <div className="text-muted small">Last 6 months</div>
                </div>
                <div className="card-body">
                  <Line 
                    data={lineData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-5">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <FaChartBar className="me-2 text-primary" />
                    Statistics Overview
                  </h5>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                  <Pie 
                    data={pieData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                    height={250}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Orders Bar Chart */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <FaCalendarAlt className="me-2 text-primary" />
                    Weekly Order Distribution
                  </h5>
                  <div className="text-muted small">Current week</div>
                </div>
                <div className="card-body">
                  <Bar 
                    data={barData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                    height={200}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Users and Orders Tables */}
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <FaUsers className="me-2 text-primary" />
                    Recent Users
                  </h5>
                  <Link to="/admin/users" className="btn btn-outline-primary btn-sm">
                    View All
                  </Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user._id}>
                              <td>{`${user.firstName} ${user.lastName}`}</td>
                              <td>{user.email}</td>
                              <td>
                                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td>
                                <Link to={`/admin/users/edit/${user._id}`} className="btn btn-sm btn-outline-secondary">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">No users found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <FaListAlt className="me-2 text-primary" />
                    Recent Orders
                  </h5>
                  <Link to="/admin/orders" className="btn btn-outline-primary btn-sm">
                    View All
                  </Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <tr key={order._id}>
                              <td>#{order._id.substring(0, 8)}</td>
                              <td>{formatDate(order.createdAt)}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                  {order.status || 'Processing'}
                                </span>
                              </td>
                              <td>{formatCurrency(order.totalPrice || 0)}</td>
                              <td>
                                <Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-secondary">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">No orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Add spinner animation CSS */}
      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard; 