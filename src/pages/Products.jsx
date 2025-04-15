import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listProducts } from '../slices/productSlice';
import { createSelector } from '@reduxjs/toolkit';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, staggerContainer } from '../utils/animationVariants';

// Create memoized selectors
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

function Products() {
  const dispatch = useDispatch();
  
  // Use memoized selector
  const { products, loading, error } = useSelector(selectProductsData);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('recommended');
  const [imgErrors, setImgErrors] = useState({});

  // Fetch products when component mounts or filters change
  useEffect(() => {
    dispatch(listProducts({ category: selectedCategory !== 'all' ? selectedCategory : '', sort: sortOrder }));
  }, [dispatch, selectedCategory, sortOrder]);

  // Handle image loading errors
  const handleImageError = (productId, imageIndex) => {
    setImgErrors(prev => {
      const productErrors = prev[productId] || [];
      return {
        ...prev,
        [productId]: [...productErrors, imageIndex]
      };
    });
  };

  // Get valid image URL for a product
  const getValidImageUrl = (product) => {
    if (!product.images || product.images.length === 0) {
      return null;
    }
    
    const productErrors = imgErrors[product._id] || [];
    
    // Try to find the first image that hasn't had an error
    for (let i = 0; i < product.images.length; i++) {
      if (!productErrors.includes(i)) {
        return product.images[i];
      }
    }
    
    // All images have errors
    return null;
  };

  // Filter out products with no valid images - memoize this computation
  const validProducts = useMemo(() => {
    return products.filter(product => 
      product.images && product.images.length > 0 && 
      (!(product._id in imgErrors) || imgErrors[product._id].length < product.images.length)
    );
  }, [products, imgErrors]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'laptops', name: 'Laptops' },
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'audio', name: 'Audio' },
    { id: 'wearables', name: 'Wearables' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'other', name: 'Other' }
  ];

  return (
    <div>
      {/* Page Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
        className="bg-light py-4"
      >
        <div className="container-fluid px-4 px-md-5">
          <h1 className="fw-bold">Products</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Products</li>
            </ol>
          </nav>
        </div>
      </motion.div>
      
      <div className="container-fluid px-4 px-md-5 py-5">
        <div className="row g-4">
          {/* Sidebar / Filters */}
          <motion.div 
            className="col-lg-3"
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="card border-0 shadow-sm mb-4"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="card-body">
                <h5 className="fw-bold mb-3">Categories</h5>
                <div className="list-group list-group-flush">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      className={`list-group-item list-group-item-action ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                      whileHover={{ x: 5 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="card border-0 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="card-body">
                <h5 className="fw-bold mb-3">Sort By</h5>
                <div className="list-group list-group-flush">
                  {[
                    { id: 'recommended', name: 'Recommended' },
                    { id: 'price-low', name: 'Price: Low to High' },
                    { id: 'price-high', name: 'Price: High to Low' },
                    { id: 'rating', name: 'Top Rated' }
                  ].map((sort, index) => (
                    <motion.button 
                      key={sort.id}
                      className={`list-group-item list-group-item-action ${sortOrder === sort.id ? 'active' : ''}`}
                      onClick={() => setSortOrder(sort.id)}
                      whileHover={{ x: 5 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {sort.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Products Grid */}
          <motion.div 
            className="col-lg-9"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : validProducts.length === 0 ? (
              <div className="alert alert-info" role="alert">
                No products found. Try a different category or search term.
              </div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4"
              >
                {validProducts.map((product) => {
                  const imageUrl = getValidImageUrl(product);
                  // Skip rendering if no valid image
                  if (!imageUrl) return null;
                  
                  return (
                    <motion.div 
                      className="col" 
                      key={product._id}
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="card h-100 border-0 shadow-sm"
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="position-relative">
                          <img 
                            src={imageUrl}
                            className="card-img-top" 
                            alt={product.name} 
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={() => handleImageError(product._id, product.images.indexOf(imageUrl))}
                          />
                          {product.discount > 0 && (
                            <motion.span 
                              className="badge bg-danger position-absolute top-0 end-0 m-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {product.discount}% OFF
                            </motion.span>
                          )}
                          {product.stock <= 0 && (
                            <motion.div 
                              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <span className="badge bg-danger fs-5">Out of Stock</span>
                            </motion.div>
                          )}
                        </div>
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between">
                            <span className="badge bg-light text-dark mb-2">{product.category}</span>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <span>{product.rating || 0}</span>
                            </div>
                          </div>
                          <h5 className="card-title fw-bold text-truncate mb-1">{product.name}</h5>
                          <p className="card-text text-primary fw-bold mb-2">${product.price?.toFixed(2) || '0.00'}</p>
                          <p className="card-text small text-truncate mb-4">{product.description}</p>
                          <div className="mt-auto">
                            <Link 
                              to={`/products/${product._id}`} 
                              className="btn btn-primary w-100"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Products; 