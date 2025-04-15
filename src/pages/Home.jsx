import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listProducts } from '../slices/productSlice';
import { createSelector } from '@reduxjs/toolkit';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import AnimatedSection from '../components/ui/AnimatedSection';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animationVariants';

// Create memoized selector for products
const selectProductsData = createSelector(
  [(state) => state.product.productList.products || [], 
   (state) => state.product.loading,
   (state) => state.product.error],
  (products, loading, error) => ({
    products,
    loading,
    error
  })
);

function Home() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(selectProductsData);
  
  useEffect(() => {
    // Fetch products when component mounts
    dispatch(listProducts({}));
  }, [dispatch]);

  // Sort products to prioritize those with images and get featured products (limited to 8)
  const featuredProducts = [...products]
    .filter(product => product.images && product.images.length > 0 && product.images[0])
    .concat(
      products.filter(product => !product.images || product.images.length === 0 || !product.images[0])
    )
    .slice(0, 8);

  return (
    <>
      {/* Hero Section - Compact */}
      <section className="bg-dark text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInLeft}
              transition={{ duration: 0.5 }}
              className="col-md-7 py-3"
            >
              <h1 className="display-5 fw-bold mb-3">Discover Premium Tech</h1>
              <p className="lead mb-3">Latest gadgets and electronics for your digital experience.</p>
              <div className="d-flex gap-2">
                <Link to="/products" className="btn btn-primary px-4 py-2">Shop Now</Link>
                <Link to="/about" className="btn btn-outline-light px-3 py-2">Learn More</Link>
              </div>
            </motion.div>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-md-5 d-none d-md-block"
            >
              <img 
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Tech devices" 
                className="img-fluid rounded shadow-lg" 
                style={{maxHeight: "280px", objectFit: "cover"}}
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Categories - Compact */}
      <AnimatedSection className="py-4 bg-light" delay={0.3}>
        <div className="container">
          <h2 className="text-center mb-4 fw-bold">Shop By Category</h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="row g-3"
          >
            {['Laptops', 'Smartphones', 'Audio', 'Accessories'].map((category, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="col-6 col-md-3"
              >
                <motion.div 
                  className="card h-100 border-0 shadow-sm hover-lift"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="card-body text-center py-3">
                    <div className="mb-2">
                      <i className={`bi bi-${['laptop', 'phone', 'headphones', 'watch'][index]} fs-2 text-primary`}></i>
                    </div>
                    <h5 className="card-title mb-0 fs-6">{category}</h5>
                    <Link to={`/products?category=${category.toLowerCase()}`} className="stretched-link"></Link>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Featured Products - Optimized */}
      <AnimatedSection className="py-4" delay={0.4}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold mb-0 fs-4">Featured Products</h2>
            <Link to="/products" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No products available at the moment. Please check back later.
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="row row-cols-2 row-cols-md-4 g-3"
            >
              {featuredProducts.map(product => {
                // Find the first valid image or use a placeholder as last resort
                let imageIndex = 0;
                let imageUrl = 'https://placehold.co/300x200/CCCCCC/808080?text=No+Image';
                
                if (product.images && product.images.length > 0) {
                  // Find first non-empty image URL
                  const validImageIndex = product.images.findIndex(img => img && img.trim() !== '');
                  if (validImageIndex >= 0) {
                    imageUrl = product.images[validImageIndex];
                    imageIndex = validImageIndex;
                  }
                }
                
                return (
                  <motion.div 
                    key={product._id} 
                    className="col"
                    variants={fadeInUp}
                  >
                    <motion.div 
                      className="card h-100 border-0 shadow-sm hover-lift product-card"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="position-relative">
                        <img 
                          src={imageUrl} 
                          className="card-img-top" 
                          alt={product.name} 
                          style={{height: '160px', objectFit: 'cover'}}
                          onError={(e) => {
                            e.target.onerror = null;
                            
                            // Try to find another valid image in the product images array
                            if (product.images && product.images.length > 0) {
                              // Start searching from the next index after current image
                              const currentIndex = imageIndex;
                              for (let i = 0; i < product.images.length; i++) {
                                const nextIndex = (currentIndex + i + 1) % product.images.length;
                                const nextImage = product.images[nextIndex];
                                if (nextImage && nextImage.trim() !== '' && nextImage !== e.target.src) {
                                  e.target.src = nextImage;
                                  return; // Found a different image, so exit
                                }
                              }
                            }
                            
                            // If we get here, no valid images were found, use placeholder
                            e.target.src = 'https://placehold.co/300x200/CCCCCC/808080?text=No+Image';
                          }}
                        />
                        {product.discount > 0 && (
                          <span className="badge bg-danger position-absolute top-0 end-0 m-2">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="card-body p-3">
                        <h5 className="card-title fs-6 fw-bold text-truncate">{product.name}</h5>
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="text-primary fw-bold mb-0">${product.price?.toFixed(2) || '0.00'}</p>
                          <div className="d-flex align-items-center small">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <span>{product.rating || 0}</span>
                          </div>
                        </div>
                        {product.stock <= 0 && (
                          <div className="text-danger mt-1"><small>Out of Stock</small></div>
                        )}
                      </div>
                      <div className="card-footer bg-white border-0 p-3 pt-0">
                        <Link to={`/products/${product._id}`} className="btn btn-primary btn-sm w-100">View Details</Link>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </AnimatedSection>
      
      {/* Banner Section - Compact */}
      <AnimatedSection className="py-4 my-3 bg-primary text-white" delay={0.5}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="fw-bold fs-3 mb-2">Special Discount</h2>
                  <p className="mb-2">Use coupon code <span className="fw-bold bg-white text-primary px-2 py-1 rounded">discount50</span> for 50% off</p>
                  <Link to="/products" className="btn btn-light px-4 py-2">Shop Now</Link>
                </div>
                <div className="d-none d-md-block ms-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1120&q=80" 
                    alt="Tech sale" 
                    className="img-fluid rounded shadow-lg" 
                    style={{maxHeight: '150px', objectFit: 'cover'}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Newsletter Section - Compact */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <h2 className="fw-bold mb-2 fs-4">Stay Updated</h2>
              <p className="mb-3 small">Subscribe for latest products and exclusive deals</p>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Your email address" />
                <button className="btn btn-primary px-3" type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home; 