import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../slices/userSlice';

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user state from Redux store
  const { loading, error: loginError, userInfo } = useSelector((state) => state.user);
  
  // Check if user came from a redirect
  const from = location.state?.from?.pathname || '/admin/dashboard';
  
  useEffect(() => {
    // If user is already logged in as admin, redirect
    if (userInfo && userInfo.role === 'admin') {
      navigate(from);
    }
    
    // If user is logged in but not as admin, show error
    if (userInfo && userInfo.role !== 'admin') {
      setError('You do not have admin privileges. Please login with an admin account.');
    }

    // Show error message if there was an unauthorized redirect
    if (location.state?.unauthorized) {
      setError(location.state.message || 'You must be an admin to access this area');
    }
  }, [userInfo, navigate, from, location.state]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    
    // Check if hardcoded admin credentials are used
    if (formData.email === 'admin' && formData.password === '123') {
      // Use the hardcoded admin credentials directly
      dispatch(login({ email: 'admin', password: '123' }));
    } else {
      // Otherwise try the entered credentials
      dispatch(login(formData));
    }
  };
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-5">
                <h1 className="fw-bold mb-0">Admin Login</h1>
                <p className="text-muted">Login to access admin dashboard</p>
              </div>
              
              {error && <div className="alert alert-danger">{error}</div>}
              {loginError && <div className="alert alert-danger">{loginError}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Username or Email</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter admin username"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control form-control-lg" 
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : 'Login as Admin'}
                  </button>
                </div>
              </form>
              
              <div className="mt-4 text-center">
                <p>
                  <small className="text-muted">
                    For demo: Username: admin, Password: 123
                  </small>
                </p>
                <p>
                  <Link to="/" className="text-decoration-none">
                    Back to Homepage
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 