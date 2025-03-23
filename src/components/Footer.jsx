import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="container-fluid px-4 px-md-5 py-5">
        <div className="row g-4">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5 className="fw-bold mb-4">
              <span className="text-primary">Peak</span>Hive
            </h5>
            <p className="mb-4">Discover premium tech products at competitive prices. Your one-stop shop for all your technology needs.</p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white fs-5">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white fs-5">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white fs-5">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white fs-5">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="col-sm-6 col-md-4 col-lg-2">
            <h6 className="text-uppercase fw-bold mb-4">Shop</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/products?category=laptops" className="text-reset">Laptops</a></li>
              <li className="mb-2"><a href="/products?category=smartphones" className="text-reset">Smartphones</a></li>
              <li className="mb-2"><a href="/products?category=audio" className="text-reset">Audio</a></li>
              <li className="mb-2"><a href="/products?category=gaming" className="text-reset">Gaming</a></li>
              <li className="mb-2"><a href="/products?category=wearables" className="text-reset">Wearables</a></li>
            </ul>
          </div>
          
          <div className="col-sm-6 col-md-4 col-lg-2">
            <h6 className="text-uppercase fw-bold mb-4">Account</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/login" className="text-reset">Login</a></li>
              <li className="mb-2"><a href="/signup" className="text-reset">Register</a></li>
              <li className="mb-2"><a href="/cart" className="text-reset">Cart</a></li>
              <li className="mb-2"><a href="/profile" className="text-reset">My Account</a></li>
              <li className="mb-2"><a href="/orders" className="text-reset">Order History</a></li>
            </ul>
          </div>
          
          <div className="col-md-4 col-lg-4">
            <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-geo-alt-fill me-2"></i>123 Tech Street, Digital City, 10001
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2"></i>info@peakhive.com
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2"></i>+1 (555) 123-4567
              </li>
              <li className="mb-2">
                <i className="bi bi-clock-fill me-2"></i>Mon-Fri: 9:00 AM - 8:00 PM
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-black py-3">
        <div className="container-fluid px-4 px-md-5">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0">© 2023 PeakHive. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                <a href="/terms" className="text-reset small">Terms of Service</a>
                <a href="/privacy" className="text-reset small">Privacy Policy</a>
                <a href="/faq" className="text-reset small">FAQ</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 