import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container">
        <div className="row g-3">
          <div className="col-md-4">
            <h5 className="mb-2"><span className="text-primary">Peak</span>Hive</h5>
            <p className="text-muted small mb-0">
              Premium tech products and accessories
            </p>
          </div>
          <div className="col-md-8">
            <div className="row">
              <div className="col-6 col-md-4">
                <h6 className="mb-2 small fw-bold">Quick Links</h6>
                <ul className="list-unstyled small">
                  <li><Link to="/products" className="text-decoration-none text-secondary">Products</Link></li>
                  <li><Link to="/cart" className="text-decoration-none text-secondary">Cart</Link></li>
                  <li><Link to="/contact" className="text-decoration-none text-secondary">Contact</Link></li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <h6 className="mb-2 small fw-bold">Categories</h6>
                <ul className="list-unstyled small">
                  <li><Link to="/products?category=laptops" className="text-decoration-none text-secondary">Laptops</Link></li>
                  <li><Link to="/products?category=smartphones" className="text-decoration-none text-secondary">Smartphones</Link></li>
                  <li><Link to="/products?category=audio" className="text-decoration-none text-secondary">Audio</Link></li>
                </ul>
              </div>
              <div className="col-md-4 mt-3 mt-md-0">
                <div className="d-flex gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-light">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-light">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-light">
                    <i className="bi bi-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-2 opacity-25" />
        <div className="row">
          <div className="col-md-6">
            <p className="small text-muted mb-0">
              © {currentYear} PeakHive. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <span className="small text-muted">
              <Link to="/privacy" className="text-decoration-none small text-muted">Privacy</Link>
              <span className="mx-2">|</span>
              <Link to="/terms" className="text-decoration-none small text-muted">Terms</Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 