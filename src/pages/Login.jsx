import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would handle authentication here
    console.log('Login attempt with:', { email, password, rememberMe });
  };
  
  return (
    <>
      <div className="row justify-content-center my-5">
        <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h2 className="fw-bold mb-4 text-center">Welcome Back</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input 
                    type="email" 
                    className="form-control form-control-lg" 
                    id="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label">Password</label>
                    <a href="/forgot-password" className="text-decoration-none small">Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    className="form-control form-control-lg" 
                    id="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                </div>
                
                <div className="d-grid mb-4">
                  <button type="submit" className="btn btn-primary btn-lg">Sign In</button>
                </div>
                
                <div className="text-center">
                  <p className="mb-0">Don't have an account? <a href="/signup" className="text-decoration-none">Sign up</a></p>
                </div>
              </form>
              
              <div className="mt-4">
                <div className="d-flex align-items-center mb-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted">or sign in with</span>
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

export default Login; 