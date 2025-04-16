import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyOrders, cancelOrder, resetCancelSuccess, deleteOrder, resetDeleteSuccess } from '../slices/orderSlice';
import { createSelector } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { FaShoppingBag, FaShippingFast, FaCheckCircle, FaTimesCircle, FaEye, FaTrash, FaPrint, FaFileInvoice, FaDownload, FaClipboardList, FaSearch, FaHourglassHalf } from 'react-icons/fa';
// Import bootstrap as a global variable
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as bootstrap from 'bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Create memoized selectors
const selectUserInfo = createSelector(
  [(state) => state.user.userInfo],
  (userInfo) => ({ userInfo })
);

const selectOrderData = createSelector(
  [(state) => state.order.myOrders, 
   (state) => state.order.loading,
   (state) => state.order.error,
   (state) => state.order.cancelSuccess,
   (state) => state.order.deleteSuccess],
  (myOrders, loading, error, cancelSuccess, deleteSuccess) => ({
    myOrders,
    loading,
    error,
    cancelSuccess,
    deleteSuccess
  })
);

function Orders() {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { userInfo } = useSelector(selectUserInfo);
  const { myOrders, loading, error, cancelSuccess, deleteSuccess } = useSelector(selectOrderData);
  const [viewAllOrders, setViewAllOrders] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [isLoading, setIsLoading] = useState(false);
  const [refundChecked, setRefundChecked] = useState(false);
  const [ordersWithCancellationRequests, setOrdersWithCancellationRequests] = useState([]);

  // Reset refund checkbox when the modal is closed or on success
  useEffect(() => {
    if (!orderToCancel) {
      setRefundChecked(false);
    }
  }, [orderToCancel]);

  // Debug log when cancel status changes
  useEffect(() => {
    console.log("cancelSuccess state changed:", cancelSuccess);
  }, [cancelSuccess]);

  // Setup polling to periodically refresh orders
  useEffect(() => {
    if (userInfo) {
      // Initial fetch - only do this once
      if (userInfo.role === 'admin') {
        dispatch(getMyOrders({ all: viewAllOrders }));
      } else {
        dispatch(getMyOrders());
      }
      
      // Create polling interval with much longer delay (5 minutes instead of 60 seconds)
      const intervalId = setInterval(() => {
        if (userInfo) {
          console.log('Refreshing orders data (scheduled)');
          if (userInfo.role === 'admin') {
            dispatch(getMyOrders({ all: viewAllOrders }))
              .unwrap()
              .catch(err => console.error('Error refreshing orders:', err));
          } else {
            dispatch(getMyOrders())
              .unwrap()
              .catch(err => console.error('Error refreshing orders:', err));
          }
        }
      }, 300000); // Poll every 5 minutes instead of every minute
      
      // Cleanup interval on component unmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [dispatch, userInfo, viewAllOrders]);

  // Initialize Bootstrap modal when component mounts
  useEffect(() => {
    const modalElement = document.getElementById('cancelOrderModal');
    if (modalElement) {
      // Store a reference to the Bootstrap modal
      const modal = new bootstrap.Modal(modalElement);
      modalRef.current = modal;
      console.log("Modal initialized:", modal);
      
      // Set up event listener for when modal is hidden
      modalElement.addEventListener('hidden.bs.modal', () => {
        if (!cancelSuccess) {
          setOrderToCancel(null);
          setIsLoading(false);
        }
      });
    }
  }, [cancelSuccess]);

  // Handle successful order cancellation
  useEffect(() => {
    if (cancelSuccess) {
      console.log("Cancel success detected in state");
      
      // Close the modal using Bootstrap API
      if (modalRef.current) {
        console.log("Hiding modal on cancel success");
        modalRef.current.hide();
      }
      
      // Show success message
      toast.success('Order cancelled successfully');
      
      // Reset the state
      dispatch(resetCancelSuccess());
      setOrderToCancel(null);
      setIsLoading(false);
      setRefundChecked(false);
      
      // Refresh the orders list
      dispatch(getMyOrders({ all: viewAllOrders }));
    }
  }, [cancelSuccess, dispatch, viewAllOrders]);

  // Handle successful order deletion
  useEffect(() => {
    if (deleteSuccess) {
      // Show success message
      toast.success('Order deleted successfully');
      
      // Reset the state
      dispatch(resetDeleteSuccess());
      
      // Refresh the orders list
      dispatch(getMyOrders({ all: viewAllOrders }));
    }
  }, [deleteSuccess, dispatch, viewAllOrders]);

  // Add useEffect to handle error from order slice
  useEffect(() => {
    if (error) {
      setIsLoading(false);
      toast.error(error);
    }
  }, [error]);

  // Add this useEffect for better debugging of modal issues
  useEffect(() => {
    if (orderToCancel) {
      console.log("Order set for cancellation:", orderToCancel._id);
    }
  }, [orderToCancel]);

  // Load cancellation requests from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('cancellationRequests');
    if (savedRequests) {
      try {
        setOrdersWithCancellationRequests(JSON.parse(savedRequests));
      } catch (error) {
        console.error('Error parsing cancellation requests:', error);
      }
    }
  }, []);

  // Save cancellation requests to localStorage whenever they change
  useEffect(() => {
    if (ordersWithCancellationRequests.length > 0) {
      localStorage.setItem('cancellationRequests', JSON.stringify(ordersWithCancellationRequests));
    }
  }, [ordersWithCancellationRequests]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let loadingTimeout;
    if (loading) {
      loadingTimeout = setTimeout(() => {
        // If still loading after 10 seconds, force reset loading state
        if (loading) {
          console.log('Loading timeout reached, resetting loading state');
          // Try to fetch orders again without the resetLoading action
          if (userInfo) {
            if (userInfo.role === 'admin') {
              dispatch(getMyOrders({ all: viewAllOrders }));
            } else {
              dispatch(getMyOrders());
            }
          }
        }
      }, 10000);
    }
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loading, dispatch, userInfo, viewAllOrders]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (order) => {
    // Check if this order has a pending cancellation request
    if (ordersWithCancellationRequests.includes(order._id)) {
      return <span className="badge bg-warning">Cancellation Requested</span>;
    }
    
    // Use the status field from order which is set by admin
    if (order.status) {
      switch (order.status.toLowerCase()) {
        case 'delivered':
          return <span className="badge bg-success">Delivered</span>;
        case 'shipped':
          return <span className="badge bg-info">Shipped</span>;
        case 'processing':
          return <span className="badge bg-primary">Processing</span>;
        case 'canceled':
          return <span className="badge bg-danger">Canceled</span>;
        case 'refunded':
          return <span className="badge bg-warning">Refunded</span>;
        case 'pending':
          return <span className="badge bg-secondary">Pending</span>;
        default:
          return <span className="badge bg-secondary">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>;
      }
    }
    
    // Fallback to legacy status properties if status field is not present
    if (order.isCanceled) {
      return <span className="badge bg-danger">Canceled</span>;
    } else if (order.isDelivered) {
      return <span className="badge bg-success">Delivered</span>;
    } else if (order.isPaid) {
      return <span className="badge bg-primary">Processing</span>;
    } else {
      return <span className="badge bg-secondary">Pending</span>;
    }
  };

  // Check if order can be canceled (only pending/unpaid orders that are not delivered)
  const canBeCanceled = (order) => {
    if (!order) return false;
    
    // Don't allow cancellation for delivered orders
    if (order.isDelivered || order.status === 'delivered') return false;
    
    // Only allow cancellation for unpaid orders or orders that aren't canceled already
    return !order.isPaid && !order.isDelivered && !order.isCanceled && order.status !== 'canceled';
  };

  // Check if order can be deleted (only delivered or cancelled orders)
  const canDeleteOrder = (order) => {
    return order.status === 'pending' || order.status === 'processing';
  };

  // Check if order is eligible for cancellation request (paid orders that are not delivered)
  const canRequestRefund = (order) => {
    if (!order) return false;
    
    // Don't allow cancellation requests for orders that already have a pending request
    if (ordersWithCancellationRequests.includes(order._id)) {
      return false;
    }
    
    // Allow cancellation requests for paid orders that are not delivered or canceled
    return order.isPaid && !order.isDelivered && !order.isCanceled && order.status !== 'delivered' && order.status !== 'canceled';
  };

  // Check if order is eligible for refund (only delivered orders)
  const canRequestDeliveredRefund = (order) => {
    if (!order) return false;
    
    // Don't allow refund requests for orders that already have a pending request
    if (ordersWithCancellationRequests.includes(order._id)) {
      return false;
    }
    
    // Only allow refund requests for paid and delivered orders that aren't canceled
    return order.isPaid && (order.isDelivered || order.status === 'delivered') && 
           !order.isCanceled && order.status !== 'canceled';
  };

  // Enhanced filter: Only show orders that strictly belong to the current user
  // and ensure they are properly processed orders (from cart checkout)
  const filteredOrders = Array.isArray(myOrders) 
    ? myOrders.filter(order => {
        // Skip orders without required data
        if (!order || !userInfo) return false;
        
        // For admin users viewing all orders, show all valid orders
        if (userInfo.role === 'admin' && viewAllOrders) {
          return (
            // Make sure the order has valid order items (processed from cart)
            Array.isArray(order.orderItems) && order.orderItems.length > 0 &&
            // Make sure the order has shipping address (checkout completed)
            order.shippingAddress && 
            (order.shippingAddress.street || order.shippingAddress.address)
          );
        }
        
        // Check that the order belongs to the current user
        // The server should already filter by user, but we double-check here
        const orderBelongsToUser = 
          // If order.user is a string ID
          (typeof order.user === 'string' && order.user === userInfo._id) || 
          // If order.user is an object with _id property
          (typeof order.user === 'object' && order.user._id && order.user._id.toString() === userInfo._id) ||
          // If there's a userId property
          (order.userId && order.userId.toString() === userInfo._id);
        
        // Make sure the order has valid order items (processed from cart)
        const hasOrderItems = Array.isArray(order.orderItems) && order.orderItems.length > 0;
        
        // Make sure the order has shipping address (checkout completed)
        const hasShippingInfo = order.shippingAddress && 
          (order.shippingAddress.street || order.shippingAddress.address);
        
        return orderBelongsToUser && hasOrderItems && hasShippingInfo;
      })
    : [];

  // Handler to refresh orders
  const handleRefreshOrders = () => {
    if (userInfo.role === 'admin') {
      dispatch(getMyOrders({ all: viewAllOrders }));
    } else {
      dispatch(getMyOrders());
    }
  };

  // Render multiple thumbnails for an order
  const renderItemThumbnails = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      return <img src="https://via.placeholder.com/100" alt="No items" className="rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />;
    }
    
    // Get up to 4 images to display
    const itemsWithImages = order.orderItems.filter(item => item.image);
    const itemsToDisplay = itemsWithImages.slice(0, 4);
    
    // If there are more than 4 items, we'll show a +N indicator
    const hasMoreItems = order.orderItems.length > 4;

  return (
      <div className="d-flex flex-wrap" style={{ gap: '4px' }}>
        {itemsToDisplay.map((item, index) => (
          <div key={index} className="position-relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className="rounded" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
            />
            {index === 3 && hasMoreItems && (
              <div className="position-absolute top-0 end-0 bottom-0 start-0 bg-dark bg-opacity-50 rounded d-flex align-items-center justify-content-center">
                <span className="text-white fw-bold small">+{order.orderItems.length - 4}</span>
        </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get number of items in order
  const getItemCount = (order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      return order.orderItems.reduce((acc, item) => {
        // Check for either qty or quantity property
        const itemCount = item.qty || item.quantity || 0;
        return acc + Number(itemCount);
      }, 0);
    }
    return 0;
  };

  // Direct cancel test function - for debugging
  const testCancelOrder = (order) => {
    console.log("Cancel action for order:", order._id);
    
    // Check if the order already has a cancellation request
    if (ordersWithCancellationRequests.includes(order._id)) {
      toast.warning("This order already has a cancellation request pending");
      return;
    }
    
    // For paid orders, show refund request form instead of cancel modal
    if (order.isPaid) {
      showRefundModal(order);
      return;
    }
    
    // For unpaid orders, proceed with normal cancellation
    setOrderToCancel(order);
    
    // Show the modal using Bootstrap's API
    if (modalRef.current) {
      console.log("Showing cancel modal via Bootstrap API");
      modalRef.current.show();
    } else {
      console.error("Modal reference is missing");
      toast.error("Could not open cancel dialog");
    }
  };

  // Show refund request modal for paid orders
  const showRefundModal = (order) => {
    setOrderToCancel(order);
    
    // Find and show the refund modal
    const refundModal = new bootstrap.Modal(document.getElementById('refundRequestModal'));
    refundModal.show();
  };

  // Handle refund request submission
  const handleRefundRequest = () => {
    if (!orderToCancel || !orderToCancel._id) {
      toast.error("No order selected for cancellation");
      return;
    }
    
    // Double check that the order doesn't already have a cancellation request
    if (ordersWithCancellationRequests.includes(orderToCancel._id)) {
      toast.error("This order already has a cancellation request pending");
      
      // Hide the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('refundRequestModal'));
      if (modal) modal.hide();
      
      return;
    }
    
    const refundReason = document.getElementById('refundReasonSelect').value;
    const refundNotes = document.getElementById('refundNotes').value;
    
    if (!refundReason) {
      toast.error("Please select a reason for your cancellation request");
      return;
    }
    
    setIsLoading(true);
    
    // Store the cancellation request data
    console.log("Submitting cancellation request:", {
      orderId: orderToCancel._id,
      reason: refundReason,
      notes: refundNotes || "No additional notes provided"
    });
    
    // Add this order to the list of orders with cancellation requests
    setOrdersWithCancellationRequests(prev => {
      if (!prev.includes(orderToCancel._id)) {
        return [...prev, orderToCancel._id];
      }
      return prev;
    });
    
    setTimeout(() => {
      setIsLoading(false);
      
      // Hide the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('refundRequestModal'));
      if (modal) modal.hide();
      
      // Show success message
      toast.success("Cancellation request submitted successfully! Our team will process it within 24-48 hours.");
      
      // Reset state
      setOrderToCancel(null);
    }, 1500);
  };

  // Handle order cancellation with Redux
  const handleCancelOrder = () => {
    if (!orderToCancel || !orderToCancel._id) {
      toast.error("No order selected for cancellation");
      return;
    }
    
    // Double check it's not a paid order
    if (orderToCancel.isPaid) {
      toast.error("Paid orders cannot be cancelled directly. Please request a refund instead.");
      
      // Close the modal
      if (modalRef.current) {
        modalRef.current.hide();
      }
      
      // Show refund modal instead
      showRefundModal(orderToCancel);
      return;
    }
    
    console.log("Cancelling order:", orderToCancel._id);
    setIsLoading(true);
    
    // Dispatch the Redux action to cancel the order
    dispatch(cancelOrder(orderToCancel._id))
      .unwrap()
      .then(() => {
        console.log("Order cancelled successfully via unwrap");
        // Success is handled in the useEffect for cancelSuccess
      })
      .catch(err => {
        console.error("Error cancelling order:", err);
        setIsLoading(false);
        
        if (typeof err === 'string' && err.includes("Cannot cancel paid")) {
          toast.error("Paid orders cannot be cancelled directly. Please request a refund instead.");
          
          // Close the cancel modal
          if (modalRef.current) {
            modalRef.current.hide();
          }
          
          // Show refund modal instead
          setTimeout(() => showRefundModal(orderToCancel), 500);
        } else {
          toast.error(err.message || err || "Failed to cancel order");
          
          // Close the modal on error
          if (modalRef.current) {
            modalRef.current.hide();
          }
        }
      });
  };

  // Render a special indicator for orders with cancellation requests
  const renderCancellationRequestIndicator = (orderId) => {
    if (ordersWithCancellationRequests.includes(orderId)) {
      return (
        <span className="d-inline-flex align-items-center text-warning ms-2">
          <FaHourglassHalf className="me-1" />
          <small>Cancellation request initiated</small>
        </span>
      );
    }
    return null;
  };

  // Add a function to filter orders by status
  const filterOrdersByStatus = (orders, status) => {
    if (!Array.isArray(orders)) return [];
    
    if (status === 'cancelled' || status === 'canceled') {
      return orders.filter(order => (
        // Check for both new field and legacy field
        order.status === 'canceled' || order.isCanceled || ordersWithCancellationRequests.includes(order._id)
      ));
    } else if (status === 'active') {
      return orders.filter(order => (
        // Check for both new field and legacy field
        order.status !== 'canceled' && !order.isCanceled && !ordersWithCancellationRequests.includes(order._id)
      ));
    }
    return orders;
  };

  // Add a function to get refund reasons based on order status
  const getRefundReasonsByStatus = (order) => {
    if (!order) return [];
    
    const commonReasons = [
      { value: "changed_mind", label: "Changed my mind" },
      { value: "other", label: "Other" }
    ];
    
    // For orders that are still processing
    if (!order.isDelivered && order.isPaid) {
      return [
        ...commonReasons,
        { value: "wrong_item", label: "Ordered wrong item" },
        { value: "delayed_delivery", label: "Taking too long to deliver" },
        { value: "found_better_price", label: "Found better price elsewhere" }
      ];
    }
    
    // For delivered orders
    if (order.isDelivered) {
      return [
        ...commonReasons,
        { value: "not_as_described", label: "Item not as described" },
        { value: "damaged", label: "Item damaged or defective" },
        { value: "incomplete", label: "Missing parts or items" },
        { value: "size_issue", label: "Size doesn't fit" }
      ];
    }
    
    return commonReasons;
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (!orderId) {
      toast.error("No order selected for deletion");
      return;
    }
    
    // Show confirmation modal
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      setIsLoading(true);
      
      // Dispatch the action to delete the order
      dispatch(deleteOrder(orderId))
        .unwrap()
        .then(() => {
          console.log("Order deleted successfully");
          // Success is handled in the useEffect for deleteSuccess
        })
        .catch(err => {
          console.error("Error deleting order:", err);
          setIsLoading(false);
          toast.error(err || "Failed to delete order");
        });
    }
  };

  // Update the renderCardView and renderTableView functions to accept filtered orders
  const renderCardView = (orders = filteredOrders) => {
    return (
      <div className="row">
        {orders.map((order) => (
          <div className="col-12 mb-4" key={order._id}>
            <div className="card h-100 border-0 shadow-sm hover-shadow">
              <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary rounded-pill me-2">
                    {order.orderId ? `#${order.orderId.slice(-6)}` : `#${order._id.slice(-6)}`}
                  </span>
                  <span className="text-muted small ms-2">
                    <FaShoppingBag className="me-1" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  {getStatusBadge(order)}
                  {renderCancellationRequestIndicator(order._id)}
                </div>
              </div>
              <div className="card-body py-3">
                <div className="row g-0">
                  {/* Order thumbnail and basic info */}
                  <div className="col-md-3 col-sm-4 d-flex">
                    <div className="d-flex align-items-center w-100">
                      <div className="flex-shrink-0 me-3">
                        {renderItemThumbnails(order)}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{getItemCount(order)} Items</h6>
                        <div className="small text-muted">
                          {order.orderItems.slice(0, 2).map(item => item.name).join(', ')}
                          {order.orderItems.length > 2 ? '...' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order status indicators */}
                  <div className="col-md-3 col-sm-4 d-flex flex-column justify-content-center my-3 my-sm-0">
                    <div className="mb-2">
                      {order.isPaid ? (
                        <span className="text-success"><FaCheckCircle className="me-1" />Paid on {formatDate(order.paidAt)}</span>
                      ) : (
                        <span className="text-danger"><FaTimesCircle className="me-1" />Not Paid</span>
                      )}
                    </div>
                    
                    <div>
                      <strong>Status: </strong>
                      {getStatusBadge(order)}
                    </div>
                  </div>
                  
                  {/* Order pricing */}
                  <div className="col-md-2 col-sm-4 d-flex flex-column justify-content-center text-center text-sm-end my-3 my-sm-0">
                    <div className="fs-5 fw-bold text-primary">${order.totalPrice.toFixed(2)}</div>
                    <div className="small text-muted">
                      {order.paymentMethod || 'Credit Card'}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="col-md-4 d-flex justify-content-end align-items-center mt-3 mt-md-0">
                    <div className="d-flex flex-wrap justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 mb-2"
                        data-bs-toggle="modal" 
                        data-bs-target={`#orderDetails-${order._id}`}
                      >
                        <FaEye className="me-1" /> View Details
                      </button>
          
                      {canBeCanceled(order) && (
                        <button
                          className="btn btn-sm btn-outline-danger me-2 mb-2"
                          onClick={() => testCancelOrder(order)}
                        >
                          <FaTimesCircle className="me-1" /> Cancel
                        </button>
                      )}
                      
                      {canRequestRefund(order) && (
                        <button
                          className="btn btn-sm btn-danger me-2 mb-2"
                          onClick={() => testCancelOrder(order)}
                        >
                          <FaTimesCircle className="me-1" /> Cancel Order
                        </button>
                      )}
                      
                      {canRequestDeliveredRefund(order) && (
                        <button
                          className="btn btn-danger btn-sm me-2 mb-2"
                          onClick={() => testCancelOrder(order)}
                          data-bs-dismiss="modal"
                        >
                          <FaTimesCircle className="me-1" /> Refund Order
                        </button>
                      )}
                      
                      {canDeleteOrder(order) && (
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          <FaTrash className="me-1" /> Delete
                        </button>
                      )}
                      
                      {order.isPaid && (
                        <button 
                          className="btn btn-sm btn-outline-secondary mb-2"
                          data-bs-toggle="modal" 
                          data-bs-target={`#invoice-${order._id}`}
                        >
                          <FaFileInvoice className="me-1" /> Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render table view of orders (original view)
  const renderTableView = (orders = filteredOrders) => {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  {userInfo.role === 'admin' && viewAllOrders && <th>Customer</th>}
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="fw-bold">{order.orderId || order._id}</span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  {userInfo.role === 'admin' && viewAllOrders && (
                    <td>
                      {order.user && typeof order.user === 'object' 
                        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email || 'Unknown'
                        : 'Unknown'}
                    </td>
                  )}
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.isPaid ? (
                      <span className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Paid on {formatDate(order.paidAt)}
                      </span>
                    ) : (
                      <span className="text-danger">
                        <i className="bi bi-x-circle me-1"></i>
                        Not Paid
                      </span>
                    )}
                  </td>
                  <td>{getStatusBadge(order)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      data-bs-toggle="modal" 
                      data-bs-target={`#orderDetails-${order._id}`}
                    >
                    <FaEye className="me-1" /> Details
                    </button>
                  
                  {canBeCanceled(order) && (
                    <button
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => testCancelOrder(order)}
                    >
                      <FaTimesCircle className="me-1" /> Cancel
                    </button>
                  )}
                  
                  {canRequestRefund(order) && (
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => testCancelOrder(order)}
                    >
                      <FaTimesCircle className="me-1" /> Cancel
                    </button>
                  )}
                  
                  {canRequestDeliveredRefund(order) && (
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => testCancelOrder(order)}
                    >
                      <FaTimesCircle className="me-1" /> Refund
                    </button>
                  )}
                  
                  {canDeleteOrder(order) && (
                    <button
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </button>
                  )}
                  
                  {order.isPaid && (
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      data-bs-toggle="modal" 
                      data-bs-target={`#invoice-${order._id}`}
                    >
                      <FaFileInvoice className="me-1" /> Invoice
                    </button>
                  )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Handle invoice download
  const handleDownloadInvoice = (order) => {
    if (!order) return;
    
    // Get the invoice element
    const invoiceElement = document.querySelector(`#invoice-${order._id} .invoice-container`);
    if (!invoiceElement) {
      toast.error("Could not find invoice element");
      return;
    }
    
    // Show loading toast
    const loadingToast = toast.loading("Generating PDF...");
    
    // Use html2canvas to capture the invoice as an image
    html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add invoice content
      pdf.setFontSize(16);
      pdf.text('INVOICE', pdfWidth / 2, 15, { align: 'center' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 25, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`invoice-${order._id}.pdf`);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Invoice downloaded successfully");
    }).catch(error => {
      console.error('Error generating PDF:', error);
      toast.dismiss(loadingToast);
      toast.error("Failed to generate PDF");
    });
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold">My Orders</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/profile">Profile</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Orders</li>
            </ol>
          </nav>
        </div>
        <div className="col-auto d-flex align-items-center">
          <div className="btn-group me-2">
            <button
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('cards')}
            >
              <i className="bi bi-grid"></i>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('table')}
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
          
          <button
            className="btn btn-outline-primary me-2"
            onClick={handleRefreshOrders}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => {
              const cancelledSection = document.getElementById('cancelled-orders-section');
              if (cancelledSection) {
                cancelledSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <FaTimesCircle className="me-1" /> View Cancelled Orders
          </button>
          
          {userInfo && userInfo.role === 'admin' && (
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="viewAllOrders"
                checked={viewAllOrders}
                onChange={(e) => setViewAllOrders(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="viewAllOrders">
                View All Orders
              </label>
        </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-5 text-center">
            <div className="mb-4">
              <i className="bi bi-bag-x" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3>No Orders Found</h3>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Active Orders Section */}
          <div className="mb-5">
            <h3 className="mb-4">Active Orders</h3>
            {filterOrdersByStatus(filteredOrders, 'active').length === 0 ? (
              <div className="alert alert-info">You don't have any active orders.</div>
            ) : (
              viewMode === 'cards' ? 
                renderCardView(filterOrdersByStatus(filteredOrders, 'active')) : 
                renderTableView(filterOrdersByStatus(filteredOrders, 'active'))
            )}
          </div>
          
          {/* Cancelled Orders Section */}
          <div className="mt-5" id="cancelled-orders-section">
            <h3 className="mb-4">Cancelled Orders</h3>
            {filterOrdersByStatus(filteredOrders, 'cancelled').length === 0 ? (
              <div className="alert alert-info">You don't have any cancelled orders.</div>
            ) : (
              viewMode === 'cards' ? 
                renderCardView(filterOrdersByStatus(filteredOrders, 'cancelled')) : 
                renderTableView(filterOrdersByStatus(filteredOrders, 'cancelled'))
            )}
          </div>
        </>
      )}

      {/* Order Detail Modals */}
      {filteredOrders.map((order) => (
        <div className="modal fade" id={`orderDetails-${order._id}`} key={`modal-${order._id}`} tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details - {order.orderId || order._id}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <h6 className="fw-bold">Shipping Address</h6>
                    <p className="mb-0">{order.shippingAddress.street || order.shippingAddress.address}</p>
                    <p className="mb-0">
                      {order.shippingAddress.city}, 
                      {order.shippingAddress.state ? ` ${order.shippingAddress.state},` : ''} 
                      {order.shippingAddress.postalCode || order.shippingAddress.zipCode}
                    </p>
                    <p className="mb-0">{order.shippingAddress.country}</p>
                      </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Order Info</h6>
                    <p className="mb-0"><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                    <div className="mb-0">
                      <strong>Status:</strong> {getStatusBadge(order)}
                      {renderCancellationRequestIndicator(order._id)}
                    </div>
                    {order.isPaid && (
                      <p className="mb-0"><strong>Paid on:</strong> {formatDate(order.paidAt)}</p>
                    )}
                    {order.isDelivered && (
                      <p className="mb-0"><strong>Delivered on:</strong> {formatDate(order.deliveredAt)}</p>
                    )}
                  </div>
                </div>
                
                <h6 className="fw-bold mb-3">Items</h6>
                <div className="table-responsive mb-4">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item._id || item.productId}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="me-2" 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <p className="mb-0 fw-bold">{item.name}</p>
                              </div>
                            </div>
                          </td>
                          <td>{Number(item.qty || item.quantity || 0)}</td>
                          <td>${Number(item.price || 0).toFixed(2)}</td>
                          <td>${(Number(item.qty || item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <h6 className="fw-bold mb-3">Payment Method</h6>
                    <p>{order.paymentMethod || 'Credit Card'}</p>
                    
                    {/* Show action buttons in the modal as well */}
                    <div className="mt-4 d-flex flex-wrap">
                      {canBeCanceled(order) && (
                        <button
                          className="btn btn-outline-danger btn-sm me-2 mb-2"
                          onClick={() => testCancelOrder(order)}
                          data-bs-dismiss="modal"
                        >
                          <FaTimesCircle className="me-1" /> Cancel Order
                        </button>
                      )}
                      
                      {canRequestRefund(order) && (
                        <button
                          className="btn btn-danger btn-sm me-2 mb-2"
                          onClick={() => testCancelOrder(order)}
                          data-bs-dismiss="modal"
                        >
                          <FaTimesCircle className="me-1" /> Cancel Order
                        </button>
                      )}
                      
                      {canRequestDeliveredRefund(order) && (
                        <button
                          className="btn btn-danger btn-sm me-2 mb-2"
                          onClick={() => testCancelOrder(order)}
                          data-bs-dismiss="modal"
                        >
                          <FaTimesCircle className="me-1" /> Refund Order
                        </button>
                      )}
                      
                      {canDeleteOrder(order) && (
                        <button
                          className="btn btn-outline-danger btn-sm me-2 mb-2"
                          onClick={() => {
                            const modal = bootstrap.Modal.getInstance(document.getElementById(`orderDetails-${order._id}`));
                            if (modal) modal.hide();
                            handleDeleteOrder(order._id);
                          }}
                        >
                          <FaTrash className="me-1" /> Delete Order
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Order Summary</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal</span>
                          <span>${(() => {
                            const itemsPrice = order.itemsPrice || 
                              (order.totalPrice - (Number(order.taxPrice || 0)) - (Number(order.shippingPrice || 0)));
                            return Number(itemsPrice || 0).toFixed(2);
                          })()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Shipping</span>
                          <span>${Number(order.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tax</span>
                          <span>${Number(order.taxPrice || 0).toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total</span>
                          <span>${Number(order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                {order.isPaid && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target={`#invoice-${order._id}`}
                    data-bs-dismiss="modal"
                  >
                    <FaFileInvoice className="me-1" /> View Invoice
                  </button>
                    )}
                  </div>
                </div>
          </div>
        </div>
      ))}

      {/* Invoice Modals */}
      {filteredOrders.filter(order => order.isPaid).map((order) => (
        <div className="modal fade" id={`invoice-${order._id}`} key={`invoice-${order._id}`} tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invoice - {order.orderId || order._id}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="invoice-container p-4">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h4 className="fw-bold text-primary mb-1">PeakHive</h4>
                      <p className="text-muted mb-0">123 E-commerce Street</p>
                      <p className="text-muted mb-0">New York, NY 10001</p>
                      <p className="text-muted mb-0">contact@peakhive.com</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <h5 className="mb-2">Invoice #{order.invoiceNumber || 
                        `INV-${order._id.substring(order._id.length - 6).toUpperCase()}`}</h5>
                      <p className="mb-0"><strong>Order ID:</strong> {order.orderId || order._id}</p>
                      <p className="mb-0"><strong>Date:</strong> {formatDate(order.paidAt || order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="fw-bold">Billed To:</h6>
                      <p className="mb-0">{order.user && typeof order.user === 'object' 
                        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() 
                        : 'Customer'}</p>
                      <p className="mb-0">{order.shippingAddress.street || order.shippingAddress.address}</p>
                      <p className="mb-0">
                        {order.shippingAddress.city}, 
                        {order.shippingAddress.state ? ` ${order.shippingAddress.state},` : ''} 
                        {order.shippingAddress.postalCode || order.shippingAddress.zipCode}
                      </p>
                      <p className="mb-0">{order.shippingAddress.country}</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <h6 className="fw-bold">Payment Information:</h6>
                      <p className="mb-0"><strong>Method:</strong> {order.paymentMethod || 'Credit Card'}</p>
                      <p className="mb-0"><strong>Status:</strong> Paid</p>
                      <p className="mb-0"><strong>Date:</strong> {formatDate(order.paidAt)}</p>
                      {order.paymentResult && (
                        <p className="mb-0"><strong>Transaction ID:</strong> {order.paymentResult.id || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="table-responsive mb-4">
                    <table className="table table-striped">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-end">Price</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((item) => (
                          <tr key={`invoice-item-${item._id || item.productId}`}>
                            <td>{item.name}</td>
                            <td className="text-center">{Number(item.qty || item.quantity || 0)}</td>
                            <td className="text-end">${Number(item.price || 0).toFixed(2)}</td>
                            <td className="text-end">${(Number(item.qty || item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                
                  <div className="row justify-content-end">
                    <div className="col-md-5">
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>${(() => {
                              const itemsPrice = order.itemsPrice || 
                                (order.totalPrice - (Number(order.taxPrice || 0)) - (Number(order.shippingPrice || 0)));
                              return Number(itemsPrice || 0).toFixed(2);
                            })()}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Shipping</span>
                            <span>${Number(order.shippingPrice || 0).toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Tax</span>
                            <span>${Number(order.taxPrice || 0).toFixed(2)}</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total</span>
                            <span>${Number(order.totalPrice || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mt-4">
                    <div className="col-md-12 text-center">
                      <p className="mb-0">Thank you for your business!</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" className="btn btn-outline-primary me-2" onClick={() => window.print()}>
                  <FaPrint className="me-1" /> Print
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleDownloadInvoice(order)}>
                  <FaDownload className="me-1" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Cancel Order Modal - With accessibility fix */}
      <div
        className="modal fade"
        id="cancelOrderModal"
        tabIndex="-1"
        aria-labelledby="cancelOrderModalLabel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="cancelOrderModalLabel">Confirm Order Cancellation</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
              
              {orderToCancel && (
                <div className="alert alert-info">
                  <p className="mb-1"><strong>Order ID:</strong> {orderToCancel._id?.slice(-6)}</p>
                  <p className="mb-1"><strong>Total:</strong> ${Number(orderToCancel.totalPrice || 0).toFixed(2)}</p>
                  <p className="mb-0"><strong>Date:</strong> {orderToCancel.createdAt ? new Date(orderToCancel.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p className="mb-0"><strong>Status:</strong> {orderToCancel.isPaid ? 'Paid' : 'Not Paid'}</p>
                </div>
              )}
              
              {/* Additional warning for paid orders */}
              {orderToCancel && orderToCancel.isPaid && (
                <div className="alert alert-warning mt-3">
                  <p className="fw-bold mb-2">This order has already been paid.</p>
                  <p className="mb-3">Cancelling a paid order requires a refund to be processed.</p>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="refundRequestCheckbox" 
                      checked={refundChecked}
                      onChange={(e) => setRefundChecked(e.target.checked)}
                      required
                    />
                    <label className="form-check-label" htmlFor="refundRequestCheckbox">
                      I acknowledge that a refund will be issued for this order.
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelOrder}
                disabled={isLoading || (orderToCancel?.isPaid && !refundChecked)}
                id="confirmCancelButton"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Request Modal - With accessibility fix */}
      <div
        className="modal fade"
        id="refundRequestModal"
        tabIndex="-1"
        aria-labelledby="refundRequestModalLabel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="refundRequestModalLabel">Cancel Order</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {orderToCancel && (
                <>
                  <div className="alert alert-info">
                    <p className="mb-1"><strong>Order ID:</strong> {orderToCancel._id?.slice(-6)}</p>
                    <p className="mb-1"><strong>Total:</strong> ${Number(orderToCancel.totalPrice || 0).toFixed(2)}</p>
                    <p className="mb-0"><strong>Date:</strong> {orderToCancel.createdAt ? new Date(orderToCancel.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  
                  <p className="my-3">
                    This order has already been paid and requires additional information to process your cancellation.
                    Please provide a reason for cancelling this order.
                  </p>
                  
                  <div className="mb-3">
                    <label htmlFor="refundReasonSelect" className="form-label">Reason for cancellation</label>
                    <select className="form-select" id="refundReasonSelect" required>
                      <option value="">Select a reason...</option>
                      {getRefundReasonsByStatus(orderToCancel).map(reason => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="refundNotes" className="form-label">Additional information</label>
                    <textarea 
                      className="form-control" 
                      id="refundNotes" 
                      rows="3" 
                      placeholder="Please provide any additional details about your cancellation request..."
                    ></textarea>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRefundRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  'Submit Cancellation Request'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>
        {`
        @media print {
          body * {
            visibility: hidden;
          }
          .modal {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            overflow: visible!important;
          }
          .modal * {
            visibility: visible;
          }
          .modal-dialog {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          .modal-content {
            border: 0;
            box-shadow: none;
          }
          .modal-header,
          .modal-footer,
          .btn-close,
          .btn {
            display: none !important;
          }
          .invoice-container {
            padding: 30px !important;
          }
        }
        `}
      </style>

      {/* Add modal close script to properly handle focus management */}
      <script>
        {`
          document.addEventListener('DOMContentLoaded', function() {
            // Fix for modal focus management
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
              modal.addEventListener('hidden.bs.modal', function() {
                // Move focus to body when modal is closed to prevent focus issues
                document.body.focus();
              });
            });
          });
        `}
      </script>
    </div>
  );
}

export default Orders; 