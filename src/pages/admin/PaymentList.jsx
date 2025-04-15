import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchPayments } from '../../api/adminApi';

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [limit] = useState(10);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPayments(page, limit, searchTerm, paymentMethod);
        
        if (data && data.success) {
          setPayments(data.payments || []);
          setTotalPages(data.pages || 1);
        } else {
          // Handle empty or unexpected response
          setPayments([]);
          setTotalPages(1);
          console.warn("Received unexpected data format:", data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading payments:', err);
        setError('Failed to load payments. Please try again later.');
        setLoading(false);
      }
    };

    loadPayments();
  }, [page, limit, searchTerm, paymentMethod]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setPage(1); // Reset to first page when changing payment method
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

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
      case 'cash':
        return 'Cash on Delivery';
      default:
        return method || 'Unknown';
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'successful':
        return 'bg-success';
      case 'processing':
      case 'pending':
        return 'bg-warning';
      case 'failed':
      case 'cancelled':
        return 'bg-danger';
      case 'refunded':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Payment Management</h2>
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
                    placeholder="Search payments by transaction ID or customer..."
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
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <option value="">All Payment Methods</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading payments...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{payment.transactionId || payment._id.substring(0, 8)}</td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>
                          {payment.user ? (
                            `${payment.user.name || payment.user.firstName || ''} ${payment.user.lastName || ''}`
                          ) : (
                            'Guest User'
                          )}
                        </td>
                        <td>
                          <Link to={`/admin/orders/${payment.order}`}>
                            {payment.order?.orderNumber || payment.order?.substring(0, 8) || 'N/A'}
                          </Link>
                        </td>
                        <td>{formatPrice(payment.amount)}</td>
                        <td>{getPaymentMethodDisplay(payment.paymentMethod)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                            {payment.status || 'Processing'}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/admin/payments/${payment._id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="View Payment"
                          >
                            <FaEye />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No payments found.
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

export default PaymentList; 