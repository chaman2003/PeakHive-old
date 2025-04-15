import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSelector } from '@reduxjs/toolkit';

// Create memoized selectors
const selectProductDetails = createSelector(
  [(state) => state.product.productDetails, 
   (state) => state.product.loading,
   (state) => state.product.error],
  (productDetails, loading, error) => ({
    productDetails,
    loading,
    error
  })
);

const selectCartLoading = createSelector(
  [(state) => state.cart.loading],
  (loading) => ({ loading })
);

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="d-flex align-items-center">
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`bi ${i < Math.floor(rating) ? 'bi-star-fill' : i < rating ? 'bi-star-half' : 'bi-star'} text-warning`}></i>
      ))}
    </div>
  );
};

// Thumbnail Component
const ProductThumbnail = ({ image, index, currentImage, setCurrentImage }) => (
  <div 
    className={`product-thumbnail mb-3 ${currentImage === index ? 'border border-primary' : ''}`}
    onClick={() => setCurrentImage(index)}
  >
    <img 
      src={image} 
      alt={`Product thumbnail ${index + 1}`} 
      className="img-fluid rounded"
    />
  </div>
);

// Review Component
const Review = ({ review }) => (
  <div className="mb-4 pb-4 border-bottom">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h5 className="fw-bold mb-0">{review.title}</h5>
      <StarRating rating={review.rating} />
    </div>
    <div className="mb-2 text-muted small">
      <span className="fw-semibold">{review.user}</span> • {review.date}
    </div>
    <p className="mb-0">{review.comment}</p>
  </div>
);

// Related Product Component
const RelatedProduct = ({ product }) => (
  <div className="col-md-4">
    <div className="card h-100 border-0 shadow-sm">
      <img src={product.image} alt={product.name} className="card-img-top" style={{ height: "180px", objectFit: "cover" }} />
      <div className="card-body text-center">
        <h6 className="card-title fw-bold">{product.name}</h6>
        <p className="card-text text-primary fw-semibold">${product.price.toFixed(2)}</p>
        <Link to={`/products/${product._id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
      </div>
    </div>
  </div>
);

function ProductDetail() {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { productDetails, loading, error } = useSelector(selectProductDetails);
  const { loading: cartLoading } = useSelector(selectCartLoading);
  
  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: productDetails._id,
      quantity,
      name: productDetails.name,
      price: productDetails.price,
      image: productDetails.images[0],
      stock: productDetails.stock
    }));
    toast.success(`${productDetails.name} added to your cart!`);
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!productDetails || !productDetails.name) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-info" role="alert">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />
      {/* Content without Navbar and Footer */}
      <div className="container-fluid py-4 px-4 px-md-5 flex-grow-1">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none">Products</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{productDetails.name}</li>
          </ol>
        </nav>
        
        {/* Product Details */}
        <div className="row g-4 mb-5">
          {/* Product Images */}
          <div className="col-lg-6">
            <div className="row">
              <div className="col-2">
                {productDetails.images && productDetails.images.map((image, index) => (
                  <ProductThumbnail 
                    key={index}
                    image={image}
                    index={index}
                    currentImage={currentImage}
                    setCurrentImage={setCurrentImage}
                  />
                ))}
              </div>
              <div className="col-10">
                <div className="main-product-image mb-3">
                  <img 
                    src={productDetails.images && productDetails.images[currentImage]} 
                    alt={productDetails.name} 
                    className="img-fluid rounded shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="col-lg-6">
            <h1 className="fw-bold mb-2">{productDetails.name}</h1>
            
            <div className="d-flex align-items-center mb-3">
              <StarRating rating={productDetails.rating} />
              <span className="ms-2 text-muted">({productDetails.numReviews || 0} reviews)</span>
            </div>
            
            <h2 className="text-primary fw-bold mb-4">${productDetails.price?.toFixed(2)}</h2>
            
            <p className="mb-4">{productDetails.description}</p>
            
            <div className="mb-4">
              <span className={`badge ${productDetails.stock > 0 ? 'bg-success' : 'bg-danger'} me-2`}>
                {productDetails.stock > 0 ? 'Available' : 'Out of Stock'}
              </span>
              <span className="badge bg-info">Free Shipping</span>
            </div>
            
            <div className="d-flex align-items-center mb-4">
              <div className="input-group me-3" style={{ maxWidth: "150px" }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <input 
                  type="text" 
                  className="form-control text-center" 
                  value={quantity}
                  readOnly
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.min(10, productDetails.stock)}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={productDetails.stock <= 0 || cartLoading}
              >
                {cartLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
            
            <div className="mb-4">
              <button className="btn btn-outline-secondary me-2">
                <i className="bi bi-heart me-1"></i>
                Add to Wishlist
              </button>
              <button className="btn btn-outline-secondary">
                <i className="bi bi-share me-1"></i>
                Share
              </button>
            </div>
            
            <div className="accordion" id="productAccordion">
              <div className="accordion-item border-0">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                    Specifications
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#productAccordion">
                  <div className="accordion-body">
                    <table className="table table-borderless mb-0">
                      <tbody>
                        {productDetails.specifications && productDetails.specifications.map((spec, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{spec.name}</td>
                            <td>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="accordion-item border-0 mt-3">
                <h2 className="accordion-header" id="headingTwo">
                  <button className="accordion-button bg-light collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                    Features
                  </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#productAccordion">
                  <div className="accordion-body">
                    <ul className="list-group list-group-flush">
                      {productDetails.features && productDetails.features.map((feature, index) => (
                        <li key={index} className="list-group-item bg-transparent ps-0">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Customer Reviews</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Add a Review'}
              </button>
            </div>
            
            {/* Review Form */}
            {showReviewForm && (
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="card-title mb-3">Write a Review</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    alert(`Review submitted: ${reviewRating} stars, "${reviewTitle}" - ${reviewComment}`);
                    setShowReviewForm(false);
                  }}>
                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label">Rating</label>
                      <select
                        className="form-select"
                        id="rating"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="reviewTitle" className="form-label">Review Title</label>
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
                      <label htmlFor="reviewComment" className="form-label">Your Review</label>
                      <textarea
                        className="form-control"
                        id="reviewComment"
                        rows="4"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary">
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Reviews List Placeholder */}
            <div className="alert alert-info">
              No reviews yet. Be the first to review this product!
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {productDetails.relatedProducts && productDetails.relatedProducts.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="fw-bold mb-4">You May Also Like</h3>
              
              <div className="row g-4">
                {productDetails.relatedProducts.map((product) => (
                  <RelatedProduct key={product._id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetail; 