import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

function ContactInfoCards() {
  return (
    <div className="row g-4 mt-4">
      <div className="col-md-6 col-lg-3">
        <div className="card border-0 shadow-sm h-100 text-center p-3">
          <div className="card-body">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
              <FaMapMarkerAlt className="fs-4 text-primary" />
            </div>
            <h5 className="card-title fw-bold">Our Location</h5>
            <p className="card-text">
              123 Business Park<br />
              San Francisco, CA 94103<br />
              United States
            </p>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="card border-0 shadow-sm h-100 text-center p-3">
          <div className="card-body">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
              <FaPhone className="fs-4 text-primary" />
            </div>
            <h5 className="card-title fw-bold">Phone Number</h5>
            <p className="card-text">
              <a href="tel:+14155550123" className="text-decoration-none">
                (415) 555-0123
              </a>
              <br />
              <span className="text-muted small">Mon-Fri, 9am-6pm PST</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="card border-0 shadow-sm h-100 text-center p-3">
          <div className="card-body">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
              <FaEnvelope className="fs-4 text-primary" />
            </div>
            <h5 className="card-title fw-bold">Email Us</h5>
            <p className="card-text">
              <a href="mailto:support@peakhive.com" className="text-decoration-none">
                support@peakhive.com
              </a>
              <br />
              <a href="mailto:sales@peakhive.com" className="text-decoration-none">
                sales@peakhive.com
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 col-lg-3">
        <div className="card border-0 shadow-sm h-100 text-center p-3">
          <div className="card-body">
            <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
              <FaWhatsapp className="fs-4 text-primary" />
            </div>
            <h5 className="card-title fw-bold">WhatsApp</h5>
            <p className="card-text">
              <a href="https://wa.me/14155550123" className="text-decoration-none">
                WhatsApp Chat
              </a>
              <br />
              <span className="text-muted small">Available 24/7</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactInfoCards; 