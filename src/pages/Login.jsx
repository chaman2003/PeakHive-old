import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../slices/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { fadeInUp, scaleUp } from '../utils/animationVariants';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirected location if available, or default to home page
  const from = location.state?.from?.pathname || '/';
  
  // Check for expired token query param
  const searchParams = new URLSearchParams(location.search);
  const tokenExpired = searchParams.get('expired') === 'true';
  
  const { loading, error, userInfo } = useSelector((state) => state.user);
  
  useEffect(() => {
    // Show expired token message
    if (tokenExpired) {
      toast.error('Your session has expired. Please log in again.');
    }
    
    // If user is already logged in, redirect to home page or the page they were trying to access
    if (userInfo) {
      navigate(from);
    }
  }, [navigate, userInfo, from, tokenExpired]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Dispatch login action
    dispatch(login({ email, password }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <>
      <ToastContainer position="top-right" />
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
        className="row justify-content-center my-5"
      >
        <div className="col-sm-11 col-md-8 col-lg-6 col-xl-5">
          <motion.div 
            variants={scaleUp}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card border-0 shadow-sm"
          >
            <div className="card-body p-4 p-md-5">
              <h2 className="fw-bold mb-4 text-center">Sign In</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              {from !== '/' && (
                <div className="alert alert-info">
                  Please login to access the requested page
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3"
                >
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-3"
                >
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control" 
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="d-flex justify-content-between mb-4"
                >
                  <div className="form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <div>
                    <a href="/forgot-password" className="text-decoration-none">Forgot password?</a>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="d-grid mb-4"
                >
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <p className="mb-0">Don't have an account? <Link to="/signup" className="text-decoration-none">Create account</Link></p>
                </motion.div>
              </form>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4"
              >
                <div className="d-flex align-items-center mb-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted">or sign in with</span>
                  <hr className="flex-grow-1" />
                </div>
                
                <div className="d-grid gap-2">
                  <motion.button 
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-google me-2"></i>Google
                  </motion.button>
                  <motion.button 
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-facebook me-2"></i>Facebook
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default Login; 