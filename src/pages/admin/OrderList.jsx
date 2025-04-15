import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEye, 
  FaSearch, 
  FaEdit, 
  FaTimes, 
  FaMoneyBillWave,
  FaTrash,
  FaCheck,
  FaList,
  FaExclamationTriangle
} from 'react-icons/fa';
import { fetchOrders } from '../../api/adminApi';
import { toast } from 'react-toastify';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, confirmVariant }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center mb-3">
              <FaExclamationTriangle className="text-warning me-2" size={24} />
              <p className="mb-0">{message}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button 
              type="button" 
              className={`btn btn-${confirmVariant || 'primary'}`} 
              onClick={onConfirm}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [limit] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    confirmVariant: 'primary'
  });

  // Open modal with configuration
  const openModal = (config) => {
    setModal({
      isOpen: true,
      ...config
    });
  };

  // Close modal
  const closeModal = () => {
    setModal({
      ...modal,
      isOpen: false
    });
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOrders(page, limit, searchTerm, selectedStatus);
        setOrders(data.orders || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
        setLoading(false);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };

    loadOrders();
  }, [page, limit, searchTerm, selectedStatus]);

  // Clear selected orders when page, search term, or status changes
  useEffect(() => {
    setSelectedOrders([]);
    setSelectAll(false);
  }, [page, searchTerm, selectedStatus]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setPage(1); // Reset to first page when changing status
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already triggered by the effect dependencies
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format price with currency
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-success';
      case 'processing':
      case 'shipped':
        return 'bg-warning';
      case 'canceled':
        return 'bg-danger';
      case 'pending':
      case 'paid':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      
      // Import updateOrderStatus function from adminApi
      const { updateOrderStatus: updateOrderStatusApi } = await import('../../api/adminApi');
      
      // Call API to update status
      await updateOrderStatusApi(orderId, { status: newStatus });
      
      // Reload orders to get updated data
      const data = await fetchOrders(page, limit, searchTerm, selectedStatus);
      setOrders(data.orders || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
      setLoading(false);
    }
  };

  // Handle order status change
  const handleOrderStatusChange = (orderId, newStatus) => {
    openModal({
      title: 'Change Order Status',
      message: `Are you sure you want to change this order's status to ${newStatus}?`,
      onConfirm: () => {
        closeModal();
        updateOrderStatus(orderId, newStatus);
      },
      confirmText: 'Change Status',
      confirmVariant: 'primary'
    });
  };

  const handleRefundRequest = async (orderId) => {
    openModal({
      title: 'Process Refund',
      message: 'Are you sure you want to initiate a refund for this order?',
      onConfirm: async () => {
        closeModal();
        try {
          setLoading(true);
          
          // Import the refundOrder function from redux slice and the store
          const { refundOrder } = await import('../../slices/orderSlice');
          const store = await import('../../store');
          
          // Use the redux action to make the API call
          await store.default.dispatch(refundOrder({ 
            orderId, 
            reason: "Administrative refund", 
            notes: "Refund processed by admin"
          })).unwrap();
          
          // Show success message
          setError(null);
          toast.success('Refund processed successfully');
          
          // Refresh orders list
          const data = await fetchOrders(page, limit, searchTerm, selectedStatus);
          setOrders(data.orders || []);
          setLoading(false);
        } catch (err) {
          console.error('Refund error:', err);
          setError('Failed to process refund');
          setLoading(false);
          toast.error('Failed to process refund');
        }
      },
      confirmText: 'Process Refund',
      confirmVariant: 'warning'
    });
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    openModal({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      onConfirm: async () => {
        closeModal();
        try {
          setLoading(true);
          
          // Import the deleteOrder function from redux slice and the store
          const { deleteOrder } = await import('../../slices/orderSlice');
          const store = await import('../../store');
          
          // Use the redux action to make the API call
          await store.default.dispatch(deleteOrder(orderId)).unwrap();
          
          // Show success message
          setError(null);
          toast.success('Order deleted successfully');
          
          // Refresh orders list
          const data = await fetchOrders(page, limit, searchTerm, selectedStatus);
          setOrders(data.orders || []);
          setLoading(false);
        } catch (err) {
          console.error('Error deleting order:', err);
          setError('Failed to delete order');
          setLoading(false);
          toast.error('Failed to delete order');
        }
      },
      confirmText: 'Delete Order',
      confirmVariant: 'danger'
    });
  };

  // Check if order can be deleted (only delivered or cancelled orders)
  const canDeleteOrder = (order) => {
    if (!order) return false;
    
    // Admin can delete any order (we're in admin panel)
    return true;
  };

  // Handle selecting or deselecting a single order
  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Handle selecting or deselecting all orders
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      toast.warning('No orders selected');
      return;
    }

    // Build confirmation message based on order count
    const message = selectedOrders.length === 1
      ? `Are you sure you want to change the status of 1 order to ${newStatus}?`
      : `Are you sure you want to change the status of ${selectedOrders.length} orders to ${newStatus}?`;
      
    openModal({
      title: 'Bulk Status Update',
      message,
      onConfirm: async () => {
        closeModal();
        setLoading(true);
        
        try {
          const { updateOrderStatus: updateOrderStatusApi } = await import('../../api/adminApi');
          let successCount = 0;
          let failCount = 0;
          
          // Show progress toast
          toast.info(`Processing ${selectedOrders.length} orders...`);
          
          // Update each selected order status one by one
          for (const orderId of selectedOrders) {
            try {
              await updateOrderStatusApi(orderId, { status: newStatus });
              successCount++;
            } catch (err) {
              console.error(`Error updating order ${orderId}:`, err);
              failCount++;
            }
          }
          
          // Show appropriate success/warning message
          if (successCount > 0 && failCount === 0) {
            toast.success(`Successfully updated ${successCount} orders to status: ${newStatus}`);
          } else if (successCount > 0 && failCount > 0) {
            toast.warning(`Updated ${successCount} orders, but failed to update ${failCount} orders`);
          } else {
            toast.error('Failed to update any orders');
          }
          
          // Refresh orders list
          const data = await fetchOrders(page, limit, searchTerm, selectedStatus);
          setOrders(data.orders || []);
          setTotalPages(Math.ceil((data.total || 0) / limit));
          
          // Clear selections
          setSelectedOrders([]);
          setSelectAll(false);
          setBulkAction('');
        } catch (err) {
          console.error('Error in bulk status update:', err);
          setError('Failed to update order statuses');
          toast.error('Failed to update order statuses');
        }
        
        setLoading(false);
      },
      confirmText: `Update to ${newStatus}`,
      confirmVariant: 'primary'
    });
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      toast.warning('No orders selected');
      return;
    }

    // Build confirmation message based on order count
    const message = selectedOrders.length === 1
      ? `Are you sure you want to delete 1 order? This action cannot be undone.`
      : `Are you sure you want to delete ${selectedOrders.length} orders? This action cannot be undone.`;
      
    openModal({
      title: 'Bulk Delete Orders',
      message,
      onConfirm: async () => {
        closeModal();
        setLoading(true);
        
        try {
          const { deleteOrder } = await import('../../slices/orderSlice');
          const store = await import('../../store');
          let successCount = 0;
          let failCount = 0;
          
          // Show progress toast
          toast.info(`Processing deletion of ${selectedOrders.length} orders...`);
          
          // Delete each selected order one by one
          for (const orderId of selectedOrders) {
            try {
              await store.default.dispatch(deleteOrder(orderId)).unwrap();
              successCount++;
            } catch (err) {
              console.error(`Error deleting order ${orderId}:`, err);
              failCount++;
            }
          }
          
          // Show appropriate success/warning message
          if (successCount > 0 && failCount === 0) {
            toast.success(`Successfully deleted ${successCount} orders`);
          } else if (successCount > 0 && failCount > 0) {
            toast.warning(`Deleted ${successCount} orders, but failed to delete ${failCount} orders`);
          } else {
            toast.error('Failed to delete any orders');
          }
          
          // Refresh orders list
          const data = await fetchOrders(page, limit, searchTerm, selectedStatus);
          setOrders(data.orders || []);
          setTotalPages(Math.ceil((data.total || 0) / limit));
          
          // Clear selections
          setSelectedOrders([]);
          setSelectAll(false);
          setBulkAction('');
        } catch (err) {
          console.error('Error in bulk delete:', err);
          setError('Failed to delete orders');
          toast.error('Failed to delete orders');
        }
        
        setLoading(false);
      },
      confirmText: 'Delete Orders',
      confirmVariant: 'danger'
    });
  };

  // Process the selected bulk action
  const processBulkAction = () => {
    if (bulkAction === '') {
      toast.warning('Please select an action');
      return;
    }
    
    if (selectedOrders.length === 0) {
      toast.warning('No orders selected');
      return;
    }
    
    if (bulkAction === 'delete') {
      handleBulkDelete();
    } else {
      handleBulkStatusUpdate(bulkAction);
    }
  };

  return (
    <div className="container py-5">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        confirmText={modal.confirmText}
        confirmVariant={modal.confirmVariant}
      />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Order Management</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search orders by ID or customer name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button className="btn btn-primary" type="submit">
                    <FaSearch /> Search
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={handleFilterStatusChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          </form>

          {/* Bulk action controls */}
          {orders.length > 0 && (
            <div className="d-flex align-items-center mb-3 bg-light p-3 rounded">
              <span className="me-2">
                <strong>Bulk Actions:</strong>
              </span>
              <select
                className="form-select me-2"
                style={{ width: 'auto' }}
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                disabled={selectedOrders.length === 0}
              >
                <option value="">Choose action</option>
                <option value="pending">Set Status: Pending</option>
                <option value="processing">Set Status: Processing</option>
                <option value="shipped">Set Status: Shipped</option>
                <option value="delivered">Set Status: Delivered</option>
                <option value="canceled">Set Status: Canceled</option>
                <option value="delete">Delete Orders</option>
              </select>
              <button 
                className="btn btn-primary me-2" 
                onClick={processBulkAction}
                disabled={selectedOrders.length === 0 || bulkAction === ''}
              >
                Apply to Selected
              </button>
              <div className="ms-auto">
                {selectedOrders.length > 0 && (
                  <span className="badge bg-primary me-2 p-2">
                    {selectedOrders.length} orders selected
                  </span>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading orders...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllCheckbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                        <label className="form-check-label" htmlFor="selectAllCheckbox"></label>
                      </div>
                    </th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`checkbox-${order._id}`}
                              checked={selectedOrders.includes(order._id)}
                              onChange={() => handleSelectOrder(order._id)}
                            />
                            <label className="form-check-label" htmlFor={`checkbox-${order._id}`}></label>
                          </div>
                        </td>
                        <td>#{order._id.substring(0, 8)}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          {order.user ? (
                            `${order.user.firstName} ${order.user.lastName}`
                          ) : (
                            'Guest User'
                          )}
                        </td>
                        <td>{formatPrice(order.totalPrice)}</td>
                        <td>
                          <span className={`badge ${order.isPaid ? 'bg-success' : 'bg-secondary'}`}>
                            {order.isPaid ? 'Paid' : 'Not Paid'}
                          </span>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button 
                              className={`btn btn-sm dropdown-toggle badge ${getStatusBadgeClass(order.status)}`}
                              type="button" 
                              id={`statusDropdown-${order._id}`}
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                            >
                              {order.status || 'Processing'}
                            </button>
                            <ul className="dropdown-menu" aria-labelledby={`statusDropdown-${order._id}`}>
                              <li><button className="dropdown-item" onClick={() => handleOrderStatusChange(order._id, 'pending')}>Pending</button></li>
                              <li><button className="dropdown-item" onClick={() => handleOrderStatusChange(order._id, 'processing')}>Processing</button></li>
                              <li><button className="dropdown-item" onClick={() => handleOrderStatusChange(order._id, 'shipped')}>Shipped</button></li>
                              <li><button className="dropdown-item" onClick={() => handleOrderStatusChange(order._id, 'delivered')}>Delivered</button></li>
                              <li><button className="dropdown-item" onClick={() => handleOrderStatusChange(order._id, 'canceled')}>Canceled</button></li>
                            </ul>
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="View Order"
                          >
                            <FaEye /> View
                          </Link>

                          {/* Refund button - shown only for delivered orders */}
                          {order.status?.toLowerCase() === 'delivered' && (
                            <button 
                              className="btn btn-sm btn-outline-warning ms-2"
                              onClick={() => handleRefundRequest(order._id)}
                            >
                              <FaMoneyBillWave /> Refund
                            </button>
                          )}

                          {/* Delete button - shown for delivered or canceled orders */}
                          {canDeleteOrder(order) && (
                            <button 
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => handleDeleteOrder(order._id)}
                              title="Delete Order"
                            >
                              <FaTrash /> Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages).keys()].map((pageNum) => (
                  <li
                    key={pageNum + 1}
                    className={`page-item ${page === pageNum + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(pageNum + 1)}
                    >
                      {pageNum + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderList;