import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaStar, FaRegStar, FaTrash, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchReviews } from '../../api/adminApi';
import { motion } from 'framer-motion';

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [limit] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch unique product list for filter
  useEffect(() => {
    const extractUniqueProducts = () => {
      if (!reviews || reviews.length === 0) return;
      
      const uniqueProducts = [...new Map(
        reviews.map(review => [
          review.productId,
          {
            id: review.productId,
            name: review.productName || `Product #${review.productId?.substring(0, 6)}`
          }
        ])
      ).values()];
      
      setProducts(uniqueProducts);
    };
    
    extractUniqueProducts();
  }, [reviews]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchReviews(page, limit, selectedRating, searchTerm, selectedProduct);
        
        if (data) {
          setReviews(data.reviews || []);
          setTotalPages(data.pages || 1);
          setTotalReviews(data.total || 0);
        } else {
          setReviews([]);
          setTotalPages(1);
          setTotalReviews(0);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };

    loadReviews();
  }, [page, limit, selectedRating, searchTerm, selectedProduct]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleRatingChange = (e) => {
    setSelectedRating(e.target.value);
    setPage(1); // Reset to first page when changing rating filter
  };
  
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
    setPage(1); // Reset to first page when changing product filter
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already triggered by the effect dependencies
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      // This would be replaced with an actual API call
      // For now, just filter it out
      setReviews(reviews.filter(review => review._id !== reviewId));
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRating('');
    setSelectedProduct('');
    setPage(1);
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }
    
    // Add empty stars
    for (let i = fullStars; i < 5; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
    }
    
    return <div className="d-flex">{stars}</div>;
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Review Management</h2>
        <div className="text-muted">
          {totalReviews > 0 ? `Total Reviews: ${totalReviews}` : 'No reviews found'}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-0 shadow-sm mb-4"
      >
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by product or review content..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button className="btn btn-primary" type="submit">
                    <FaSearch /> Search
                  </button>
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={selectedRating}
                  onChange={handleRatingChange}
                  aria-label="Filter by rating"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={selectedProduct}
                  onChange={handleProductChange}
                  aria-label="Filter by product"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary w-100"
                  onClick={resetFilters}
                >
                  <FaFilter className="me-1" /> Reset
                </button>
              </div>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading reviews...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Rating</th>
                    <th>Product</th>
                    <th>Comment</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <motion.tr 
                        key={review._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td>{renderStars(review.rating)}</td>
                        <td>
                          <Link to={`/products/${review.productId}`} className="text-primary">
                            {review.productName || `Product #${review.productId?.substring(0, 6)}`}
                          </Link>
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px' }} className="text-truncate">
                            <strong>{review.title}</strong> - {review.comment}
                          </div>
                        </td>
                        <td>
                          {review.user?.firstName 
                            ? `${review.user.firstName} ${review.user.lastName}` 
                            : 'Anonymous'}
                        </td>
                        <td>{formatDate(review.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              to={`/products/${review.productId}`}
                              className="btn btn-sm btn-outline-primary"
                              title="View Product Page"
                            >
                              <FaEye />
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Review"
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="alert alert-info">
                          No reviews found with the current filters.
                        </div>
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
      </motion.div>
    </div>
  );
}

export default ReviewList; 