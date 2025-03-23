import React, { useState } from 'react';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would handle registration here
    console.log('Registration attempt with:', formData);
    
    // Validation would be performed here
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
  };
  
  return (
    <>
      <div className="row justify-content-center my-5">
        <div className="col-sm-11 col-md-10 col-lg-8 col-xl-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h2 className="fw-bold mb-4 text-center">Create an Account</h2>
              
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
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">Password must be at least 8 characters long</div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
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
                  <button type="submit" className="btn btn-primary btn-lg">Create Account</button>
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