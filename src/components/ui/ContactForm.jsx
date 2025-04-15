import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';

function ContactForm({ formData, formSubmitted, handleChange, handleSubmit, loading }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white p-3 border-0">
        <h3 className="fs-4 fw-bold mb-0">
          <FaPaperPlane className="text-primary me-2" /> Send Us a Message
        </h3>
      </div>
      <div className="card-body p-4">
        {formSubmitted && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <div className="me-2">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div>
              Thank you for your message! We'll get back to you as soon as possible.
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label fw-medium">
                Your Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg border-0 bg-light"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading || formSubmitted}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-medium">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control form-control-lg border-0 bg-light"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || formSubmitted}
                required
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="subject" className="form-label fw-medium">
              Subject <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control form-control-lg border-0 bg-light"
              id="subject"
              name="subject"
              placeholder="What is this regarding?"
              value={formData.subject}
              onChange={handleChange}
              disabled={loading || formSubmitted}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="form-label fw-medium">
              Message <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control form-control-lg border-0 bg-light"
              id="message"
              name="message"
              rows="5"
              placeholder="Your message here..."
              value={formData.message}
              onChange={handleChange}
              disabled={loading || formSubmitted}
              required
            ></textarea>
          </div>
          
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg fw-medium"
              disabled={loading || formSubmitted}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </span>
              ) : formSubmitted ? (
                <span>
                  <i className="bi bi-check-circle me-2"></i>
                  Message Sent
                </span>
              ) : (
                <span>
                  <FaPaperPlane className="me-2" /> Send Message
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm; 