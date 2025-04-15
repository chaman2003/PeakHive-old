import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaPlus, FaInfoCircle } from 'react-icons/fa';
import { fetchProducts, deleteProduct } from '../../api/adminApi';
import { toast } from 'react-toastify';

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [limit] = useState(10);
  const [expandedProductId, setExpandedProductId] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts(page, limit, searchTerm, category);
        setProducts(data.products || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
        setLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, limit, searchTerm, category]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1); // Reset to first page when changing category
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already triggered by the effect dependencies
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This will also remove it from all customer carts and wishlists.')) {
      try {
        setLoading(true);
        // Call the deleteProduct API function
        const result = await deleteProduct(productId);
        
        // Refresh the product list
        const data = await fetchProducts(page, limit, searchTerm, category);
        setProducts(data.products || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
        
        // Show detailed success notification
        toast.success(
          <div>
            <p className="mb-1"><strong>{result.productName}</strong> deleted successfully</p>
            <p className="mb-0 small">{result.cleanup}</p>
          </div>,
          { autoClose: 5000 }
        );
        setLoading(false);
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again.');
        setLoading(false);
        
        // Show error notification
        toast.error('Failed to delete product. Please try again.');
      }
    }
  };

  const toggleProductDetails = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const handleEditProduct = (e, productId) => {
    e.stopPropagation();
    navigate(`/admin/products/edit/${productId}`);
  };

  // Format price with currency
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Product hover detail popup
  const ProductDetailPopup = ({ product }) => {
    if (!product) return null;

    return (
      <div>
        {/* Product Images */}
        <div className="product-images mb-3">
          <div className="row g-3">
            {product.images && product.images.slice(0, 4).map((img, index) => (
              <div className="col-6 col-md-3" key={index}>
                <div 
                  className="product-image-container"
                  style={{ 
                    height: '180px', 
                    overflow: 'hidden', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  <img 
                    src={img || 'https://via.placeholder.com/150'} 
                    alt={`${product.name} ${index+1}`}
                    className="w-100 h-100"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="row">
          {/* Product Description */}
          <div className="col-md-6 mb-3">
            <h6 className="fw-bold text-secondary mb-1 small">Description</h6>
            <p className="text-muted small">{product.description || 'No description available'}</p>
          
            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-3">
                <h6 className="fw-bold text-secondary mb-1 small">Features</h6>
                <ul className="list-unstyled small">
                  {product.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="text-muted small mb-1">
                      <FaInfoCircle className="text-primary me-1" size={12} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="col-md-6">
            {/* Product Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-3">
                <h6 className="fw-bold text-secondary mb-1 small">Specifications</h6>
                <ul className="list-unstyled small">
                  {product.specifications.slice(0, 5).map((spec, index) => (
                    <li key={index} className="mb-1">
                      <span className="text-primary small fw-bold">{spec.name}:</span>{' '}
                      <span className="text-muted small">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Product Details */}
            <div className="bg-light p-2 rounded">
              <div className="text-muted small">
                <div><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}</div>
                <div><strong>Price:</strong> {formatPrice(product.price)}</div>
                <div><strong>Category:</strong> {product.category}</div>
                <div><strong>Brand:</strong> {product.brand || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Product Management</h2>
        <Link to="/admin/products/create" className="btn btn-primary">
          <FaPlus className="me-2" />
          Add New Product
        </Link>
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
                    placeholder="Search products by name..."
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
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  <option value="laptops">Laptops</option>
                  <option value="smartphones">Smartphones</option>
                  <option value="audio">Audio</option>
                  <option value="gaming">Gaming</option>
                  <option value="wearables">Wearables</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading products...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <React.Fragment key={product._id}>
                        <tr 
                          className={expandedProductId === product._id ? 'table-active' : ''}
                          onClick={() => toggleProductDetails(product._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div style={{ width: '100px', height: '100px', overflow: 'hidden', borderRadius: '8px' }}>
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/100'}
                                alt={product.name}
                                className="w-100 h-100"
                                style={{ objectFit: 'cover', objectPosition: 'center' }}
                                onError={(e) => {e.target.src = 'https://via.placeholder.com/100'}}
                              />
                            </div>
                          </td>
                          <td>
                            <Link 
                              to={`/products/${product._id}`} 
                              className="text-decoration-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {product.name}
                            </Link>
                          </td>
                          <td>{product.category}</td>
                          <td>{formatPrice(product.price)}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                onClick={(e) => handleEditProduct(e, product._id)}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit Product"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(product._id);
                                }}
                                title="Delete Product"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedProductId === product._id && (
                          <tr className="product-detail-row">
                            <td colSpan="5" className="p-0 border-0">
                              <div className="shadow-lg p-3 bg-white rounded m-2">
                                <ProductDetailPopup product={product} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No products found.
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

export default ProductList; 