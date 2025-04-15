import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../slices/wishlistSlice';
import { addToCart } from '../slices/cartSlice';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get wishlist state from Redux
  const { wishlistItems, loading, error } = useSelector(state => state.wishlist);
  const { userInfo } = useSelector(state => state.user);
  
  // Fetch wishlist items on component mount
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    dispatch(fetchWishlist());
  }, [dispatch, userInfo, navigate]);
  
  // Handler to move item from wishlist to cart
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      image: product.images && product.images[0],
      price: product.price || 0,
      stock: product.stock || 0,
      quantity: 1
    }));
    
    toast.success(`${product.name} added to cart!`);
  };
  
  // Handler to remove item from wishlist
  const handleRemoveFromWishlist = (productId, productName) => {
    dispatch(removeFromWishlist(productId));
    toast.info(`${productName} removed from wishlist`);
  };
  
  // Handler to clear the entire wishlist
  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist());
      toast.info('Wishlist cleared');
    }
  };
  
  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold mb-0">My Wishlist</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Wishlist</li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="row">
        <div className="col">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your wishlist...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <FaHeart size={50} className="text-danger opacity-50" />
              </div>
              <h4>Your wishlist is empty</h4>
              <p className="text-muted mb-4">Add products to your wishlist to save them for later.</p>
              <Link to="/products" className="btn btn-primary px-4 py-2">
                <FaArrowLeft className="me-2" /> Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={handleClearWishlist}
                  disabled={loading}
                >
                  <FaTrash className="me-2" /> Clear Wishlist
                </button>
              </div>
              
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {wishlistItems.map(product => (
                  <div key={product._id} className="col">
                    <div className="card h-100 border-0 shadow-sm hover-lift">
                      <div className="position-relative">
                        <img 
                          src={product.images && product.images[0]} 
                          alt={product.name} 
                          className="card-img-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x400/CCCCCC/808080?text=No+Image';
                          }}
                        />
                        <button 
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                          onClick={() => handleRemoveFromWishlist(product._id, product.name)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title mb-2 fw-bold">{product.name}</h5>
                        <p className="card-text text-primary fw-bold mb-1">${product.price?.toFixed(2)}</p>
                        <p className="card-text text-muted small mb-3">
                          {product.stock > 0 ? <span className="text-success">Available</span> : <span className="text-danger">Out of stock</span>}
                        </p>
                        <div className="mt-auto d-grid gap-2">
                          <Link 
                            to={`/products/${product._id}`} 
                            className="btn btn-outline-secondary"
                          >
                            View Details
                          </Link>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                          >
                            <FaShoppingCart className="me-2" /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 