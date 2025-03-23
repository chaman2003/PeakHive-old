import React from 'react';

function Home() {
  return (
    <>
      {/* Hero Section - Full Width */}
      <section className="bg-dark text-white py-5">
        <div className="container-fluid px-4 px-md-5">
          <div className="row align-items-center">
            <div className="col-md-6 py-5">
              <h1 className="display-4 fw-bold mb-4">Discover Premium Tech at PeakHive</h1>
              <p className="lead mb-4">Explore the latest gadgets and electronics that will transform your digital experience.</p>
              <div className="d-flex gap-3">
                <a href="/products" className="btn btn-primary btn-lg px-4 py-2">Shop Now</a>
                <a href="/about" className="btn btn-outline-light btn-lg px-4 py-2">Learn More</a>
              </div>
            </div>
            <div className="col-md-6 d-none d-md-block">
              <img 
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Tech devices" 
                className="img-fluid rounded shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Categories */}
      <section className="py-5 bg-light">
        <div className="container-fluid px-4 px-md-5">
          <h2 className="text-center mb-5 fw-bold">Shop By Category</h2>
          <div className="row g-4">
            {['Laptops', 'Smartphones', 'Audio', 'Accessories'].map((category, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="card h-100 border-0 shadow-sm hover-lift">
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <i className={`bi bi-${['laptop', 'phone', 'headphones', 'watch'][index]} fs-1 text-primary`}></i>
                    </div>
                    <h5 className="card-title mb-0">{category}</h5>
                    <a href={`/products?category=${category.toLowerCase()}`} className="stretched-link"></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-5">
        <div className="container-fluid px-4 px-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Featured Products</h2>
            <a href="/products" className="btn btn-outline-primary">View All</a>
          </div>
          
          <div className="row g-4">
            {[
              {
                id: 1,
                name: 'Premium Headphones',
                price: 199.99,
                image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1165&q=80',
                rating: 4.7
              },
              {
                id: 2,
                name: 'Smart Watch Pro',
                price: 299.99,
                image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80',
                rating: 4.9
              },
              {
                id: 3,
                name: 'Ultra Slim Laptop',
                price: 1299.99,
                image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
                rating: 4.6
              },
              {
                id: 4,
                name: 'Gaming Controller',
                price: 69.99,
                image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
                rating: 4.5
              }
            ].map(product => (
              <div key={product.id} className="col-6 col-md-3">
                <div className="card h-100 border-0 shadow-sm hover-lift product-card">
                  <div className="position-relative">
                    <img src={product.image} className="card-img-top" alt={product.name} style={{height: '200px', objectFit: 'cover'}} />
                    <button className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle bg-white p-2 shadow-sm">
                      <i className="bi bi-heart"></i>
                    </button>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{product.name}</h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="text-primary fw-bold mb-0">${product.price}</p>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 d-grid">
                    <a href={`/products/${product.id}`} className="btn btn-primary">View Details</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Banner Section */}
      <section className="py-5 my-5 bg-primary text-white">
        <div className="container-fluid px-4 px-md-5">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h2 className="fw-bold display-5 mb-3">Summer Sale</h2>
              <p className="lead mb-4">Get up to 40% off on selected items. Limited time offer!</p>
              <a href="/products?sale=true" className="btn btn-light btn-lg px-4">Shop the Sale</a>
            </div>
            <div className="col-md-6 text-center">
              <img 
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1120&q=80" 
                alt="Tech sale" 
                className="img-fluid rounded shadow-lg" 
                style={{maxHeight: '300px', objectFit: 'cover'}}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <h2 className="fw-bold mb-3">Stay Updated</h2>
              <p className="mb-4">Subscribe to our newsletter for the latest products and exclusive deals.</p>
              <div className="row g-2 justify-content-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <input type="email" className="form-control form-control-lg" placeholder="Your email address" />
                    <button className="btn btn-primary btn-lg px-4" type="button">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home; 