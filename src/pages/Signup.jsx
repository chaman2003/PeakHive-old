import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../slices/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, userInfo } = useSelector((state) => state.user);
  
  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (!formData.agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    // Dispatch register action with object parameter
    dispatch(register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    }));
  };
  
  return (
    <>
      <ToastContainer position="top-right" />
      <div className="row justify-content-center my-5">
        <div className="col-sm-11 col-md-10 col-lg-8 col-xl-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h2 className="fw-bold mb-4 text-center">Create an Account</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="firstName" 
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="lastName" 
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="phone" 
                    name="phone"
                    placeholder="+1 (123) 456-7890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <div className="form-text">Optional - Enter a phone number for account recovery</div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <input 
                      type={passwordVisibility.password ? "text" : "password"} 
                      className="form-control" 
                      id="password" 
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {passwordVisibility.password ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="form-text">Password must be at least 8 characters long</div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <input 
                      type={passwordVisibility.confirmPassword ? "text" : "password"} 
                      className="form-control" 
                      id="confirmPassword" 
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      {passwordVisibility.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="mb-4 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                  <label className="form-check-label" htmlFor="agreeTerms">
                    I agree to the <a href="/terms" className="text-decoration-none">Terms of Service</a> and <a href="/privacy" className="text-decoration-none">Privacy Policy</a>
                  </label>
                </div>
                
                <div className="d-grid mb-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="mb-0">Already have an account? <a href="/login" className="text-decoration-none">Sign in</a></p>
                </div>
              </form>
              
              <div className="mt-4">
                <div className="d-flex align-items-center mb-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted">or sign up with</span>
                  <hr className="flex-grow-1" />
                </div>
                
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-google me-2"></i>Google
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-facebook me-2"></i>Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;