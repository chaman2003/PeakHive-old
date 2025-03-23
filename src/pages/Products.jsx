import React, { useState } from 'react';

function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('recommended');

  const productData = [
    {
      id: 1,
      name: 'Premium Headphones',
      category: 'audio',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1165&q=80',
      rating: 4.7,
      stock: 15
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      category: 'wearables',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80',
      rating: 4.9,
      stock: 8
    },
    {
      id: 3,
      name: 'Ultra Slim Laptop',
      category: 'laptops',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
      rating: 4.6,
      stock: 3
    },
    {
      id: 4,
      name: 'Gaming Controller',
      category: 'gaming',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      rating: 4.5,
      stock: 22
    },
    {
      id: 5,
      name: 'Smartphone X',
      category: 'smartphones',
      price: 899.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      rating: 4.8,
      stock: 7
    },
    {
      id: 6,
      name: 'Wireless Earbuds',
      category: 'audio',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
      rating: 4.3,
      stock: 18
    }
  ];

  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? productData 
    : productData.filter(product => product.category === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-low') return a.price - b.price;
    if (sortOrder === 'price-high') return b.price - a.price;
    if (sortOrder === 'rating') return b.rating - a.rating;
    return 0; // recommended - no specific sorting
  });

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'laptops', name: 'Laptops' },
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'audio', name: 'Audio' },
    { id: 'wearables', name: 'Wearables' },
    { id: 'gaming', name: 'Gaming' }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="bg-light py-4">
        <div className="container-fluid px-4 px-md-5">
          <h1 className="fw-bold">Products</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Products</li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="container-fluid px-4 px-md-5 py-5">
        <div className="row g-4">
          {/* Sidebar / Filters */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Categories</h5>
                <div className="list-group list-group-flush">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`list-group-item list-group-item-action ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Price Range</h5>
                <div className="mb-3">
                  <label htmlFor="priceRange" className="form-label">Max Price: $1500</label>
                  <input type="range" className="form-range" min="0" max="1500" id="priceRange" />
                </div>
                
                <h5 className="fw-bold mb-3 mt-4">Rating</h5>
                <div className="mb-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="fourStarsAndUp" />
                    <label className="form-check-label" htmlFor="fourStarsAndUp">
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star text-muted"></i>
                      <span className="ms-1">& Up</span>
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="threeStarsAndUp" />
                    <label className="form-check-label" htmlFor="threeStarsAndUp">
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star text-muted"></i>
                      <i className="bi bi-star text-muted"></i>
                      <span className="ms-1">& Up</span>
                    </label>
                  </div>
                </div>
                
                <h5 className="fw-bold mb-3 mt-4">Availability</h5>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="inStock" checked readOnly />
                  <label className="form-check-label" htmlFor="inStock">
                    In Stock
                  </label>
                </div>
                
                <button className="btn btn-primary w-100 mt-4">Apply Filters</button>
              </div>
            </div>
          </div>
          
          {/* Product Listing */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0">Showing {sortedProducts.length} results</p>
              <div className="d-flex align-items-center">
                <label className="me-2">Sort by:</label>
                <select 
                  className="form-select" 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            
            <div className="row g-4">
              {sortedProducts.map(product => (
                <div key={product.id} className="col-md-6 col-xl-4">
                  <div className="card h-100 border-0 shadow-sm hover-lift product-card">
                    <div className="position-relative">
                      <img 
                        src={product.image} 
                        className="card-img-top" 
                        alt={product.name} 
                        style={{height: '220px', objectFit: 'cover'}} 
                      />
                      <button className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle bg-white p-2 shadow-sm">
                        <i className="bi bi-heart"></i>
                      </button>
                      {product.stock < 5 && (
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-danger">Low Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between">
                        <span className="badge bg-light text-dark mb-2">{product.category}</span>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <h5 className="card-title fw-bold">{product.name}</h5>
                      <p className="text-primary fw-bold mb-3">${product.price}</p>
                      <div className="mt-auto d-flex justify-content-between">
                        <a href={`/products/${product.id}`} className="btn btn-outline-primary">View Details</a>
                        <button className="btn btn-primary">
                          <i className="bi bi-cart-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <nav className="mt-5">
              <ul className="pagination justify-content-center">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">Previous</a>
                </li>
                <li className="page-item active"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item">
                  <a className="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products; 