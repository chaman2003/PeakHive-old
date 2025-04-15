import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../slices/userSlice';
import { getUserActions, navLinks } from '../../data/navigationData';
import { toast } from 'react-toastify';

function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isAdminLoginPage, setIsAdminLoginPage] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.user);

  // Get cart items from Redux store
  const { cartItems } = useSelector((state) => state.cart);

  // Check if current page is in admin section or admin login page
  useEffect(() => {
    const isAdmin = location.pathname.includes('/admin');
    const isAdminLogin = location.pathname === '/admin/login';
    setIsAdminPage(isAdmin);
    setIsAdminLoginPage(isAdminLogin);
  }, [location.pathname]);

  const closeNavbar = () => {
    if (isExpanded) setIsExpanded(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // First, dispatch the logout action
      dispatch(logout());
      
      // Close navbar
      closeNavbar();
      
      // Force navigation to home page with a slight delay to ensure state is updated
      setTimeout(() => {
        navigate('/');
        toast.success('You have been logged out successfully');
      }, 100);
    }
  };

  // Handle admin logout specifically
  const handleAdminLogout = () => {
    if (window.confirm('Are you sure you want to logout from admin panel?')) {
      // First, dispatch the logout action
      dispatch(logout());
      
      // Force navigation to home page
      window.location.href = '/';
    }
  };

  // Generate user actions based on login status
  const userActionLinks = getUserActions(!!userInfo, cartItems?.length || 0, userInfo?.role);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container-fluid px-3 px-md-5">
        <Link className="navbar-brand fw-bold fs-3" to={isAdminPage ? "/admin/dashboard" : "/"} onClick={closeNavbar}>
          {isAdminPage ? (
            <span>Admin <span className="text-primary">Dashboard</span></span>
          ) : (
            <><span className="text-primary">Peak</span>Hive</>
          )}
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
          {!isAdminPage && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {navLinks.map((link, index) => (
                <li className="nav-item" key={index}>
                  <NavLink 
                    className={({isActive}) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`} 
                    to={link.path}
                    onClick={closeNavbar}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
          
          {isAdminPage ? (
            <ul className="navbar-nav ms-auto">
              {userInfo && !isAdminLoginPage && (
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-danger d-flex align-items-center"
                    onClick={handleAdminLogout}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </button>
                </li>
              )}
            </ul>
          ) : (
            <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
              {userActionLinks.map((action, index) => (
                <Link 
                  key={index}
                  to={action.path} 
                  className={`btn ${action.className} d-flex align-items-center`} 
                  onClick={closeNavbar}
                >
                  {action.icon && <i className={`bi bi-${action.icon} me-1`}></i>}
                  {action.label}
                  {action.badge && <span className="badge bg-primary ms-1">{action.badge}</span>}
                </Link>
              ))}
              {userInfo && (
                <button 
                  className="btn btn-outline-danger d-flex align-items-center"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 