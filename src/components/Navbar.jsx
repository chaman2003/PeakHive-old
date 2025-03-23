import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const closeNavbar = () => {
    if (isExpanded) setIsExpanded(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container-fluid px-3 px-md-5">
        <Link className="navbar-brand fw-bold fs-3" to="/" onClick={closeNavbar}>
          <span className="text-primary">Peak</span>Hive
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-expanded={isExpanded}
          aria-label="Toggle navigation"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isExpanded ? 'show' : ''}`} id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/"
                onClick={closeNavbar}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/products"
                onClick={closeNavbar}
              >
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/about"
                onClick={closeNavbar}
              >
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                to="/contact"
                onClick={closeNavbar}
              >
                Contact
              </NavLink>
            </li>
          </ul>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link to="/cart" className="btn btn-outline-light d-flex align-items-center" onClick={closeNavbar}>
              <i className="bi bi-cart me-1"></i> Cart <span className="badge bg-primary ms-1">0</span>
            </Link>
            <Link to="/login" className="btn btn-primary" onClick={closeNavbar}>
              Login
            </Link>
            <Link to="/signup" className="btn btn-success" onClick={closeNavbar}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 