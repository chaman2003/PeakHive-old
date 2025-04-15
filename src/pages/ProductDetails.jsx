import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { createReview, getProductReviews, resetReviewState } from '../slices/reviewSlice';
import { addToWishlist, fetchWishlist } from '../slices/wishlistSlice';
import { FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaHeart, FaRegHeart, FaShare, FaChevronLeft, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animationVariants';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get product state from Redux
  const { product, loading: productLoading, error: productError } = useSelector((state) => state.product);
  const { userInfo } = useSelector((state) => state.user);
  const { reviews, loading: reviewLoading, success: reviewSuccess, error: reviewError } = useSelector((state) => state.review);
  const { wishlistItems, loading: wishlistLoading, success: wishlistSuccess } = useSelector(state => state.wishlist);
  
  // For debugging
  console.log("Product from state:", product);
  console.log("Product ID from URL:", id);
  
  // Cart state
  const [quantity, setQuantity] = useState(1);
  
  // Add current image index state for gallery
  const [currentImage, setCurrentImage] = useState(0);
  
  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  
  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  
  // Share state
  const [isSharing, setIsSharing] = useState(false);
  
  // Load product details and reviews
  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id));
      dispatch(getProductReviews(id));
      // Scroll to top when component mounts
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  // Load wishlist items if user is logged in
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlistItems.length > 0 && product) {
      const inWishlist = wishlistItems.some(item => item._id === product._id);
      setIsInWishlist(inWishlist);
    }
  }, [wishlistItems, product]);

  // Handle wishlist success
  useEffect(() => {
    if (wishlistSuccess && addingToWishlist) {
      toast.success('Product added to wishlist!');
      setAddingToWishlist(false);
    }
  }, [wishlistSuccess, addingToWishlist]);

  // Reset review state on success
  useEffect(() => {
    if (reviewSuccess) {
      setRating(5);
      setReviewTitle('');
      setReviewComment('');
      setShowReviewForm(false);
      dispatch(resetReviewState());
    }
  }, [reviewSuccess, dispatch]);
  
  // Add to cart handler
  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        image: product.images && product.images[0],
        price: product.price || 0,
        stock: product.stock || 0,
        quantity
      }));
      navigate('/cart');
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = () => {
    if (!userInfo) {
      toast.info('Please login to add items to your wishlist');
      navigate('/login');
      return;
    }

    if (product && !isInWishlist) {
      setAddingToWishlist(true);
      dispatch(addToWishlist(product._id));
    } else if (isInWishlist) {
      navigate('/wishlist');
    }
  };
  
  // Share product handler
  const handleShareProduct = async () => {
    setIsSharing(true);
    
    // Create share data
    const productUrl = window.location.href;
    const shareTitle = `Check out ${product.name} on PeakHive`;
    const shareText = `${product.name} - $${product.price?.toFixed(2) || '0.00'}\n${product.description?.substring(0, 100)}...`;
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: productUrl,
    };
    
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Thanks for sharing!');
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${productUrl}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      
      // Fallback if share or clipboard API fails
      try {
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = productUrl;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        toast.success('Link copied to clipboard!');
      } catch (fallbackError) {
        toast.error('Unable to share. Please copy the URL manually.');
      }
    } finally {
      setIsSharing(false);
    }
  };
  
  // Handle review submission
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!userInfo) {
      toast.error("Please login to post a review");
      navigate('/login');
      return;
    }
    
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!reviewTitle.trim()) {
      toast.error("Please provide a review title");
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error("Please provide review comments");
      return;
    }

    if (!id || !product?._id) {
      toast.error("Invalid product information");
      return;
    }
    
    // Create the review with correct payload matching server requirements
    const reviewData = {
      productId: id,
      product: id, // Added product field to match exact model
      title: reviewTitle.trim(),
      rating: Number(rating),
      comment: reviewComment.trim(),
      productName: product.name || 'Product'
    };
    
    // Log the exact payload for debugging
    console.log("Review payload:", reviewData);
    
    dispatch(createReview(reviewData))
      .unwrap()
      .then(() => {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setRating(5);
        setReviewTitle('');
        setReviewComment('');
        
        // Refresh reviews after submission
        dispatch(getProductReviews(id));
      })
      .catch((err) => {
        console.error("Review submission error:", err);
        
        // More descriptive error messages
        if (typeof err === 'string' && err.includes('already reviewed')) {
          toast.error("You have already reviewed this product.");
        } else if (err && err.includes && err.includes('E11000 duplicate key')) {
          toast.error("You have already submitted a review for this product.");
        } else {
          toast.error(err?.message || "Failed to submit review. Please try again.");
        }
      });
  };
  
  // Thumbnail Component
  const ProductThumbnail = ({ image, index }) => (
    <motion.div 
      className={`product-thumbnail mb-2 ${currentImage === index ? 'border border-primary p-1 rounded' : 'p-1'}`}
      onClick={() => setCurrentImage(index)}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div style={{ 
        width: '60px', 
        height: '60px',
        overflow: 'hidden'
      }}>
        <img 
          src={image} 
          alt={`Thumbnail ${index + 1}`}
          className="img-fluid"
          style={{ 
            objectFit: 'cover',
            height: '100%',
            width: '100%'
          }}
        />
      </div>
    </motion.div>
  );
  
  // Rating Stars
  const RatingStars = ({ value }) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.span 
            key={star}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + (star * 0.1) }}
          >
            {value >= star ? (
              <FaStar className="text-warning" />
            ) : value >= star - 0.5 ? (
              <FaStarHalfAlt className="text-warning" />
            ) : (
              <FaRegStar className="text-warning" />
            )}
          </motion.span>
        ))}
        <motion.span 
          className="ms-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          ({value || 0})
        </motion.span>
      </div>
    );
  };
  
  // Interactive Rating Input for Review Form
  const RatingInput = () => {
    // Temporary hover state to show preview of rating
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
      <div className="mb-4">
        <label className="fw-bold mb-2 d-block">Your Rating</label>
        <div className="d-flex align-items-center">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.span 
                key={star}
                onClick={() => {
                  setRating(star);
                  // Add some haptic feedback via toast
                  toast.success(`You rated this product ${star} star${star > 1 ? 's' : ''}!`, {
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: true
                  });
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ 
                  cursor: 'pointer',
                  display: 'inline-block',
                  padding: '0 5px',
                  position: 'relative'
                }}
                whileHover={{ scale: 1.4 }}
                whileTap={{ 
                  scale: 1.8,
                  rotate: [-10, 10],
                  transition: { 
                    duration: 0.3, 
                    type: "spring",
                    stiffness: 300
                  }
                }}
                animate={{ 
                  scale: rating === star ? 1.4 : 1,
                  y: rating === star ? -5 : 0,
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    duration: 0.3
                  }
                }}
              >
                {(hoverRating >= star || rating >= star) ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      color: "#ffc107",
                      scale: rating === star ? 1.2 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaStar className="fs-2" />
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{ 
                      opacity: hoverRating > 0 ? 0.5 : 1,
                      scale: 1
                    }}
                  >
                    <FaRegStar className="fs-2" />
                  </motion.span>
                )}
                
                {/* Add subtle pulsing glow effect when selected */}
                {rating === star && (
                  <motion.div
                    className="position-absolute"
                    style={{
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(255, 193, 7, 0.3)",
                      zIndex: -1,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 0.7, 
                      scale: 1.3
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                )}
              </motion.span>
            ))}
          </div>
          <span className="ms-3 text-muted">
            {hoverRating > 0 ? 
              `${hoverRating} star${hoverRating > 1 ? 's' : ''}` : 
              (rating > 0 ? `Your rating: ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate')}
          </span>
        </div>
      </div>
    );
  };
  
  if (productLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }
  
  if (productError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {productError}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          <FaChevronLeft className="me-2" /> Back to Products
        </button>
      </div>
    );
  }
  
  if (!product || !product._id) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Product not found.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          <FaChevronLeft className="me-2" /> Back to Products
        </button>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <motion.nav 
        aria-label="breadcrumb" 
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Products</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </motion.nav>
      
      <div className="row">
        {/* Product Images */}
        <motion.div 
          className="col-md-6 mb-4 mb-md-0"
          variants={fadeInLeft}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          <div className="row">
            {/* Thumbnails */}
            <div className="col-2 d-flex flex-column">
              {product.images && product.images.map((image, index) => (
                <ProductThumbnail key={index} image={image} index={index} />
              ))}
            </div>
            
            {/* Main Image */}
            <div className="col-10">
              <motion.div 
                className="bg-light rounded shadow-sm position-relative"
                style={{ minHeight: '400px' }}
                layoutId={`product-main-image-${product._id}`}
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImage}
                    src={product.images && product.images[currentImage]}
                    alt={product.name}
                    className="img-fluid rounded"
                    style={{ 
                      width: '100%', 
                      height: '400px', 
                      objectFit: 'contain' 
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                
                {product.discount > 0 && (
                  <motion.span 
                    className="badge bg-danger position-absolute top-0 end-0 m-3 fs-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [-5, 0, 5, 0] }}
                    transition={{ duration: 0.5, times: [0, 0.3, 0.6, 1] }}
                  >
                    {product.discount}% OFF
                  </motion.span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Product Details */}
        <motion.div 
          className="col-md-6"
          variants={fadeInRight}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="fw-bold mb-2" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {product.name}
          </motion.h2>
          
          <motion.div 
            className="mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RatingStars value={product.rating || 0} />
          </motion.div>
          
          <motion.div 
            className="mb-3 d-flex align-items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-primary fw-bold mb-0">${product.price?.toFixed(2) || '0.00'}</h3>
            {product.discount > 0 && (
              <span className="text-decoration-line-through text-muted ms-2">
                ${((product.price || 0) * (100 / (100 - product.discount))).toFixed(2)}
              </span>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="mb-4">{product.description}</p>
          </motion.div>
          
          <motion.div 
            className="mt-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} me-2`}>
              {product.stock > 0 ? 'Available' : 'Out of Stock'}
            </span>
            <span className="badge bg-secondary">{product.category}</span>
          </motion.div>
          
          {product.stock > 0 && (
            <motion.div 
              className="d-flex align-items-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="input-group" style={{ width: '140px' }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  className="form-control text-center" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={product.stock}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="d-flex flex-wrap mb-4 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button 
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <FaShoppingCart className="me-2" /> Add to Cart
            </motion.button>
            
            <motion.button 
              className={`btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
            >
              {isInWishlist ? (
                <>
                  <FaHeart className="me-2" /> In Wishlist
                </>
              ) : (
                <>
                  <FaRegHeart className="me-2" /> Add to Wishlist
                </>
              )}
            </motion.button>
            
            <motion.button 
              className="btn btn-outline-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareProduct}
              disabled={isSharing}
            >
              <FaShare className="me-2" /> Share
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Product Specifications & Features */}
      <motion.div 
        className="my-5"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
            <h3 className="mb-0 fw-bold">Product Specifications</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12">
                <div className="row g-3">
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="spec-item text-center p-3 h-100 border rounded">
                      <h6 className="fw-bold text-uppercase small mb-2 text-secondary">Brand</h6>
                      <p className="mb-0 fw-bold">Sony</p>
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="spec-item text-center p-3 h-100 border rounded">
                      <h6 className="fw-bold text-uppercase small mb-2 text-secondary">Category</h6>
                      <p className="mb-0 fw-bold">Audio</p>
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="spec-item text-center p-3 h-100 border rounded">
                      <h6 className="fw-bold text-uppercase small mb-2 text-secondary">Status</h6>
                      <p className="mb-0 fw-bold">
                        <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {product.stock > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="spec-item text-center p-3 h-100 border rounded">
                      <h6 className="fw-bold text-uppercase small mb-2 text-secondary">SKU</h6>
                      <p className="mb-0 fw-bold">67F816BC</p>
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="spec-item text-center p-3 h-100 border rounded">
                      <h6 className="fw-bold text-uppercase small mb-2 text-secondary">Weight</h6>
                      <p className="mb-0 fw-bold">0.5 kg</p>
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="spec-item text-center p-3 h-100 border rounded">
                      <h6 className="fw-bold text-uppercase small mb-2 text-secondary">Warranty</h6>
                      <p className="mb-0 fw-bold">1 Year Limited Warranty</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="fw-bold mb-3">Key Features</h4>
              <div className="row">
                <div className="col-md-12">
                  {(product.features && product.features.length > 0) ? (
                    <div className="row g-3">
                      {product.features.map((feature, index) => (
                        <motion.div 
                          key={index}
                          className="col-md-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + (index * 0.1) }}
                        >
                          <div className="feature-card p-3 h-100 border rounded bg-white shadow-sm hover-shadow">
                            <div className="d-flex align-items-start">
                              <div className="feature-icon me-3">
                                <motion.div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                  style={{ width: '40px', height: '40px' }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <i className="bi bi-check2 text-white fs-5"></i>
                                </motion.div>
                              </div>
                              <div className="feature-content">
                                <p className="mb-0 fw-medium">{feature}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-4 bg-light rounded border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <i className="bi bi-info-circle fs-1 text-muted mb-3 d-block"></i>
                      <p className="mb-0 text-muted">No features available for this product</p>
                      {userInfo?.isAdmin && (
                        <Link to={`/admin/product/${product._id}/edit`} className="btn btn-sm btn-outline-primary mt-3">
                          <i className="bi bi-pencil me-1"></i> Add Product Features
                        </Link>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Show View More button if there are many features */}
              {product.features && product.features.length > 6 && (
                <motion.div 
                  className="text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-chevron-down me-2"></i> View All Features
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Reviews Section */}
      <motion.div 
        className="mt-5 pt-4 border-top"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Customer Reviews</h3>
          
          <div className="d-flex gap-2">
            {userInfo && (
              <>
                <motion.button 
                  className="btn btn-warning"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowReviewForm(true);
                    setRating(5);
                    setReviewTitle("");
                    setReviewComment("");
                  }}
                >
                  <FaStar className="me-2" /> Rate This Product
                </motion.button>
                <motion.button 
                  className="btn btn-outline-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write a Review
                </motion.button>
              </>
            )}
            {!userInfo && (
              <Link to="/login" className="btn btn-outline-primary">
                Login to Review
              </Link>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {showReviewForm && (
            <motion.div 
              className="card mb-4 shadow-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body">
                <h4 className="mb-3">Write Your Review</h4>
                
                {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                
                <form onSubmit={handleSubmitReview}>
                  <RatingInput />
                  
                  <div className="mb-3">
                    <label htmlFor="reviewTitle" className="form-label">Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="reviewTitle"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="reviewComment" className="form-label">Comment</label>
                    <textarea 
                      className="form-control" 
                      id="reviewComment"
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <motion.button 
                      type="submit" 
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </motion.button>
                    
                    <motion.button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {reviewLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading reviews...</span>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="alert alert-light text-center">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="row"
          >
            {reviews.map((review, index) => (
              <motion.div 
                key={review._id} 
                className="col-md-6 mb-4"
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div 
                  className="card h-100 border-0 shadow-sm"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <h5 className="fw-bold">{review.title}</h5>
                      <RatingStars value={review.rating} />
                    </div>
                    <p className="card-text">{review.comment}</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="fw-bold">{review.name}</div>
                      <small className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductDetails; 