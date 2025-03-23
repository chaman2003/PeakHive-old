import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock product data
const product = {
  id: 1,
  name: "Ultra HD Smart TV - 55\"",
  price: 899.99,
  rating: 4.7,
  reviewCount: 124,
  inStock: true,
  description: "Experience stunning 4K resolution and smart features in this sleek 55-inch TV. Perfect for streaming, gaming, and bringing your content to life with vibrant colors and sharp detail.",
  images: [
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1601944177325-f8867652837f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1176&q=80"
  ],
  specifications: [
    { name: "Screen Size", value: "55 inches" },
    { name: "Resolution", value: "3840 x 2160 (4K UHD)" },
    { name: "Display Technology", value: "LED" },
    { name: "Smart TV Platform", value: "WebOS" },
    { name: "HDR Support", value: "HDR10, Dolby Vision" },
    { name: "Refresh Rate", value: "120Hz" },
    { name: "Connectivity", value: "Wi-Fi, Bluetooth, HDMI x4, USB x3" },
    { name: "Audio", value: "20W speakers, Dolby Atmos" }
  ],
  features: [
    "4K Ultra HD Resolution for stunning clarity",
    "Smart TV functionality with built-in streaming apps",
    "Voice control compatibility with multiple assistants",
    "Game Mode for reduced input lag",
    "Slim design with minimal bezels",
    "Energy efficient with auto power-saving mode"
  ],
  relatedProducts: [
    { id: 2, name: "Wireless Noise-Cancelling Headphones", price: 249.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" },
    { id: 3, name: "Smart Home Security Camera", price: 129.99, image: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80" },
    { id: 4, name: "Wireless Gaming Mouse", price: 59.99, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80" }
  ],
  reviews: [
    { 
      id: 1, 
      user: "Alex Johnson", 
      date: "July 15, 2023", 
      rating: 5, 
      title: "Best TV I've ever owned!",
      comment: "The picture quality is absolutely stunning, and the smart features work seamlessly. Setup was a breeze, and the remote is intuitive. Highly recommend this TV to anyone looking for an upgrade."
    },
    { 
      id: 2, 
      user: "Sam Miller", 
      date: "June 22, 2023", 
      rating: 4, 
      title: "Great value for the price",
      comment: "For the price point, this TV offers excellent features and performance. The 4K is crisp, and the colors are vibrant. The only reason I'm giving 4 stars is because the audio could be a bit better, but that's easily fixed with a soundbar."
    },
    { 
      id: 3, 
      user: "Taylor Wilson", 
      date: "May 10, 2023", 
      rating: 5, 
      title: "Gaming performance is excellent",
      comment: "I bought this primarily for gaming on my new console, and I'm impressed with the low input lag and smooth motion handling. The Game Mode makes a noticeable difference, and HDR games look fantastic."
    }
  ]
};

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
        <Link to={`/products/${product.id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
      </div>
    </div>
  </div>
);

function ProductDetail() {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      {/* Content without Navbar and Footer */}
      <div className="container-fluid py-4 px-4 px-md-5 flex-grow-1">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none">Products</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>
        
        {/* Product Details */}
        <div className="row g-4 mb-5">
          {/* Product Images */}
          <div className="col-lg-6">
            <div className="row">
              <div className="col-2">
                {product.images.map((image, index) => (
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
                    src={product.images[currentImage]} 
                    alt={product.name} 
                    className="img-fluid rounded shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="col-lg-6">
            <h1 className="fw-bold mb-2">{product.name}</h1>
            
            <div className="d-flex align-items-center mb-3">
              <StarRating rating={product.rating} />
              <span className="ms-2 text-muted">({product.reviewCount} reviews)</span>
            </div>
            
            <h2 className="text-primary fw-bold mb-4">${product.price.toFixed(2)}</h2>
            
            <p className="mb-4">{product.description}</p>
            
            <div className="mb-4">
              <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'} me-2`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="badge bg-info">Free Shipping</span>
            </div>
            
            <div className="d-flex align-items-center mb-4">
              <div className="input-group me-3" style={{ maxWidth: "150px" }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                >
                  -
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
                >
                  +
                </button>
              </div>
              
              <button className="btn btn-primary fw-semibold">
                <i className="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
            </div>
            
            <div className="d-flex flex-wrap mb-4">
              <button className="btn btn-outline-primary me-2 mb-2 d-inline-flex align-items-center">
                <i className="bi bi-heart me-1"></i> Add to Wishlist
              </button>
              <button className="btn btn-outline-secondary mb-2 d-inline-flex align-items-center">
                <i className="bi bi-share me-1"></i> Share
              </button>
            </div>
            
            <div className="border-top pt-4">
              <h5 className="fw-bold mb-3">Key Features</h5>
              <ul className="mb-0">
                {product.features.map((feature, index) => (
                  <li key={index} className="mb-2">{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Product Specifications */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h3 className="fw-bold mb-4">Specifications</h3>
                <div className="row">
                  {product.specifications.map((spec, index) => (
                    <div className="col-md-6 mb-3" key={index}>
                      <div className="d-flex">
                        <div className="fw-semibold" style={{ minWidth: "150px" }}>{spec.name}:</div>
                        <div>{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Reviews */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold mb-0">Customer Reviews</h3>
                  <button className="btn btn-primary">Write a Review</button>
                </div>
                
                <div className="mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center mb-2">
                    <StarRating rating={product.rating} />
                    <span className="ms-2 fw-semibold">{product.rating} out of 5</span>
                  </div>
                  <p className="text-muted mb-0">Based on {product.reviewCount} reviews</p>
                </div>
                
                {product.reviews.map(review => (
                  <Review key={review.id} review={review} />
                ))}
                
                <div className="d-flex justify-content-center">
                  <button className="btn btn-outline-primary">Load More Reviews</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="fw-bold mb-4">You May Also Like</h3>
            <div className="row g-4">
              {product.relatedProducts.map(item => (
                <RelatedProduct key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail; 