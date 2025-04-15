import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getOrderDetails, cancelOrder, resetLoading } from '../slices/orderSlice';
import { toast } from 'react-toastify';
import { FaTimesCircle, FaUndo, FaTruck, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Add a timeout to prevent infinite loading
const LOADING_TIMEOUT = 10000; // 10 seconds

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { order, loading, error, cancelSuccess } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.user);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initial fetch of order details
  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);
  
  // Setup polling to check for order status updates
  useEffect(() => {
    // Create polling interval to refresh order details
    const intervalId = setInterval(() => {
      if (id) {
        console.log('Refreshing order details (scheduled)');
        dispatch(getOrderDetails(id))
          .unwrap()
          .catch(err => console.error('Error refreshing order details:', err));
      }
    }, 300000); // Poll every 5 minutes instead of 30 seconds
    
    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, id]);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let loadingTimeout;
    if (loading) {
      loadingTimeout = setTimeout(() => {
        // If still loading after timeout, reset loading state and try again
        if (loading) {
          console.warn('Order details loading timeout reached, resetting state');
          dispatch(resetLoading());
          
          // Try to fetch order details again
          if (id) {
            dispatch(getOrderDetails(id));
          }
        }
      }, LOADING_TIMEOUT);
    }
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loading, dispatch, id]);
  
  // Handle successful cancel
  useEffect(() => {
    if (cancelSuccess) {
      toast.success('Order cancelled successfully');
      // Refresh order details
      dispatch(getOrderDetails(id));
    }
  }, [cancelSuccess, dispatch, id]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(id));
    }
  };
  
  const handleRefundRequest = () => {
    if (!refundReason) {
      toast.error('Please select a reason for refund');
      return;
    }
    
    setIsProcessing(true);
    
    // In a production app, this would be an API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowRefundModal(false);
      toast.success('Refund request submitted successfully');
      // Store in localStorage to simulate persistence
      const refundRequests = JSON.parse(localStorage.getItem('refundRequests') || '[]');
      refundRequests.push({ orderId: id, reason: refundReason, date: new Date().toISOString() });
      localStorage.setItem('refundRequests', JSON.stringify(refundRequests));
      setRefundReason('');
    }, 1000);
  };
  
  const canBeCancelled = (order) => {
    if (!order) return false;
    
    // First check if the order status allows cancellation
    if (order.status) {
      const status = order.status.toLowerCase();
      // Only allow cancellation for pending or processing orders
      // Don't allow cancellation for shipped, delivered, canceled or refunded orders
      return status === 'pending' || status === 'processing';
    }
    
    // Fallback to old logic
    return !order.isCanceled && 
           !order.isDelivered && 
           order.status !== 'shipped' &&
           order.status !== 'delivered' &&
           order.status !== 'canceled';
  };
  
  const canRequestRefund = (order) => {
    if (!order) return false;
    
    // First check using order status
    if (order.status) {
      const status = order.status.toLowerCase();
      // Allow refund requests for delivered or shipped orders
      return status === 'delivered' || status === 'shipped';
    }
    
    // Fallback to old logic
    return order.isPaid && 
           !order.isCanceled && 
           (order.status === 'delivered' || order.status === 'shipped');
  };
  
  const getRefundReasons = () => {
    return [
      { value: 'wrong_item', label: 'Received wrong item' },
      { value: 'damaged', label: 'Item damaged or defective' },
      { value: 'not_as_described', label: 'Item not as described' },
      { value: 'late_delivery', label: 'Delivery too late' },
      { value: 'better_price', label: 'Found better price elsewhere' },
      { value: 'changed_mind', label: 'Changed my mind' },
      { value: 'other', label: 'Other' }
    ];
  };
  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Order not found
        </div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">Order #{order.orderId}</h2>
                <span className={`badge bg-${
                  order.status === 'delivered' ? 'success' : 
                  order.status === 'shipped' ? 'info' : 
                  order.status === 'processing' ? 'primary' :
                  order.status === 'canceled' ? 'danger' : 
                  'warning'
                }`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
              </div>
            </div>
            <div className="card-body">
              <p className="mb-1"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="mb-3"><strong>Order ID:</strong> {order.orderId || order._id}</p>
              
              {/* Status Timeline */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="mb-3">Order Status</h6>
                <div className="d-flex flex-wrap status-timeline">
                  <div className={`status-item ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                    <div className="status-icon"><FaCheckCircle /></div>
                    <div className="status-text">Order Placed</div>
                  </div>
                  <div className={`status-item ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                    <div className="status-icon"><FaCheckCircle /></div>
                    <div className="status-text">Processing</div>
                  </div>
                  <div className={`status-item ${order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                    <div className="status-icon"><FaTruck /></div>
                    <div className="status-text">Shipped</div>
                  </div>
                  <div className={`status-item ${order.status === 'delivered' ? 'active' : ''}`}>
                    <div className="status-icon"><FaCheckCircle /></div>
                    <div className="status-text">Delivered</div>
                  </div>
                  {(order.status === 'canceled') && (
                    <div className="status-item active cancelled">
                      <div className="status-icon"><FaTimesCircle /></div>
                      <div className="status-text">Canceled</div>
                    </div>
                  )}
                </div>
              </div>
              
              <h5 className="mt-4 mb-3">Items</h5>
              <div className="table-responsive mb-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item) => (
                      <tr key={item.productId}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <div>{item.name}</div>
                          </div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatCurrency(item.price)}</td>
                        <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span>{formatCurrency(order.taxPrice)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
              
              <div className="mt-4 pt-2 border-top">
                <h6 className="mb-2">Shipping Address</h6>
                <p className="mb-1">{order.shippingAddress.street}</p>
                <p className="mb-1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
                <p className="mb-3">{order.shippingAddress.country}</p>
                
                <h6 className="mb-2">Payment Method</h6>
                <p className="mb-0">{order.paymentMethod}</p>
                <p className="mb-3">
                  <span className={`badge bg-${order.isPaid ? 'success' : 'warning'}`}>
                    {order.isPaid ? 'Paid' : 'Processing Payment'}
                  </span>
                </p>
                
                {/* Action Buttons */}
                {userInfo && (
                  <div className="d-grid gap-2 mt-4">
                    {canBeCancelled(order) && (
                      <button 
                        className="btn btn-outline-danger" 
                        onClick={handleCancelOrder}
                      >
                        <FaTimesCircle className="me-2" />
                        Cancel Order
                      </button>
                    )}
                    
                    {canRequestRefund(order) && (
                      <button 
                        className="btn btn-outline-warning" 
                        onClick={() => setShowRefundModal(true)}
                      >
                        <FaUndo className="me-2" />
                        Request Refund
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/orders" className="btn btn-outline-secondary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
      
      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Refund</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRefundModal(false)}
                  disabled={isProcessing}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <FaExclamationTriangle className="me-2" />
                  Refund requests are reviewed within 1-2 business days.
                </div>
                
                <div className="mb-3">
                  <label htmlFor="refundReason" className="form-label">Reason for Refund</label>
                  <select 
                    className="form-select" 
                    id="refundReason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason...</option>
                    {getRefundReasons().map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="refundNotes" className="form-label">Additional Notes</label>
                  <textarea 
                    className="form-control" 
                    id="refundNotes" 
                    rows="3"
                    placeholder="Please provide any additional details about your refund request..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowRefundModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleRefundRequest}
                  disabled={isProcessing || !refundReason}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
      
      <style jsx>{`
        .status-timeline {
          position: relative;
          display: flex;
          justify-content: space-between;
          margin: 0 20px;
        }
        
        .status-timeline:before {
          content: '';
          position: absolute;
          top: 15px;
          left: 5%;
          right: 5%;
          height: 2px;
          background: #e0e0e0;
          z-index: 1;
        }
        
        .status-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          z-index: 2;
        }
        
        .status-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          color: #dee2e6;
        }
        
        .status-text {
          font-size: 0.75rem;
          text-align: center;
          color: #6c757d;
        }
        
        .status-item.active .status-icon {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }
        
        .status-item.active .status-text {
          color: #212529;
          font-weight: 500;
        }
        
        .status-item.cancelled .status-icon {
          background: #dc3545;
          border-color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default OrderDetailPage; 