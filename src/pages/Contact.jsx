import React, { useState } from 'react';
import ContactForm from '../components/ui/ContactForm';
import ContactInfoCards from '../components/ui/ContactInfoCards';
import PageBanner from '../components/ui/PageBanner';
import { Helmet } from 'react-helmet';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send data to the backend API using the configured api instance
      await api.post('/contact', formData);
      
      setFormSubmitted(true);
      setLoading(false);
      toast.success('Thank you! Your message has been sent successfully.');
      
      // Reset the form after successful submission
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 3000);
    } catch (error) {
      setLoading(false);
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again later.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | PeakHive</title>
        <meta name="description" content="Get in touch with our team for any questions, support, or business inquiries. We're here to help you." />
      </Helmet>

      <PageBanner title="Contact Us" subtitle="Get in touch with our team" />
      
      <div className="container py-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="row mb-5"
        >
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h2 className="fw-bold mb-4">We're Here To Help</h2>
            <p className="lead text-muted mb-4">
              Have questions about our products, services, or need assistance with your account? 
              Our dedicated team is ready to assist you.
            </p>
            <p className="mb-4">
              Fill out the form and we'll get back to you as soon as possible. You can also reach us directly 
              using the contact information provided.
            </p>
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary rounded p-2 me-3">
                <i className="bi bi-clock text-white"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold">Business Hours</h6>
                <p className="mb-0 text-muted small">Monday - Friday: 9am - 6pm PST</p>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <ContactForm 
              formData={formData} 
              formSubmitted={formSubmitted} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="fw-bold text-center mb-4">Our Contact Information</h3>
          <ContactInfoCards />
        </motion.div>
      </div>
      
      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default Contact; 