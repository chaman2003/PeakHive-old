import React, { useState } from 'react';

// Contact info cards data
const contactInfo = [
  {
    icon: "geo-alt-fill",
    title: "Visit Us",
    content: <>
      123 Tech Street<br />
      Digital City, CA 94103<br />
      United States
    </>
  },
  {
    icon: "envelope-fill", 
    title: "Email Us",
    content: <>
      <strong>General Inquiries:</strong><br />
      <a href="mailto:info@peakhive.com" className="text-decoration-none">info@peakhive.com</a>
      <div className="mt-2">
        <strong>Support:</strong><br />
        <a href="mailto:support@peakhive.com" className="text-decoration-none">support@peakhive.com</a>
      </div>
    </>
  },
  {
    icon: "telephone-fill",
    title: "Call Us",
    content: <>
      <strong>Customer Support:</strong><br />
      <a href="tel:+15551234567" className="text-decoration-none">+1 (555) 123-4567</a>
      <div className="mt-2">
        <strong>Hours:</strong><br />
        Monday-Friday: 9am-6pm EST
      </div>
    </>
  }
];

// FAQ data
const faqItems = [
  {
    id: "One",
    question: "What are your shipping options?",
    answer: "We offer free standard shipping on all orders over $50, which typically takes 3-5 business days. Express shipping is available for an additional fee and arrives within 1-2 business days."
  },
  {
    id: "Two",
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of purchase. Items must be in their original condition and packaging. To initiate a return, please contact our customer service team."
  },
  {
    id: "Three",
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within the United States and Canada. We're working on expanding our international shipping options and hope to serve more countries soon."
  },
  {
    id: "Four",
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can also view the status of your order by logging into your account and visiting the \"Order History\" section."
  }
];

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with:', formData);
    setFormSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setFormSubmitted(false), 5000);
  };
  
  return (
    <>
      <section className="bg-primary text-white py-5">
        <div className="container-fluid px-4 px-md-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="fw-bold display-4 mb-3">Contact Us</h1>
              <p className="lead mb-0">We'd love to hear from you! Reach out with any questions, feedback, or concerns.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-5 bg-light">
        <div className="container-fluid px-4 px-md-5">
          <div className="row justify-content-center g-4">
            {contactInfo.map((info, index) => (
              <div className="col-lg-3 col-md-6 col-sm-10" key={index}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                      <i className={`bi bi-${info.icon} fs-2`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{info.title}</h5>
                    <p className="mb-0">{info.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact Form */}
      <section className="py-5 flex-grow-1">
        <div className="container-fluid px-4 px-md-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <h2 className="fw-bold text-center mb-4">Send Us a Message</h2>
                  
                  {formSubmitted && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      Your message has been sent successfully! We'll get back to you soon.
                      <button type="button" className="btn-close" onClick={() => setFormSubmitted(false)}></button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label">Your Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="name" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">Your Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-12">
                        <label htmlFor="subject" className="form-label">Subject</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="subject" 
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-12">
                        <label htmlFor="message" className="form-label">Message</label>
                        <textarea 
                          className="form-control" 
                          id="message" 
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="col-12">
                        <div className="d-grid">
                          <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-5 bg-light">
        <div className="container-fluid px-4 px-md-5">
          <h2 className="fw-bold text-center mb-5">Frequently Asked Questions</h2>
          
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="accordion" id="faqAccordion">
                {faqItems.map((item, index) => (
                  <div className="accordion-item border-0 shadow-sm mb-3" key={index}>
                    <h2 className="accordion-header" id={`heading${item.id}`}>
                      <button 
                        className={`accordion-button fw-medium ${index !== 0 ? 'collapsed' : ''}`} 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${item.id}`} 
                        aria-expanded={index === 0 ? 'true' : 'false'} 
                        aria-controls={`collapse${item.id}`}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div 
                      id={`collapse${item.id}`} 
                      className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                      aria-labelledby={`heading${item.id}`} 
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact; 