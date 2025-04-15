import React from 'react';

function FAQSection({ faqItems }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <h2 className="fw-bold text-center mb-4">Frequently Asked Questions</h2>
        
        <div className="accordion" id="faqAccordion">
          {faqItems.map((item, index) => (
            <div className="accordion-item border-0 mb-3 shadow-sm" key={index}>
              <h3 className="accordion-header">
                <button 
                  className="accordion-button collapsed bg-light" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#faq-${index}`}
                >
                  {item.question}
                </button>
              </h3>
              <div 
                id={`faq-${index}`} 
                className="accordion-collapse collapse" 
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
  );
}

export default FAQSection; 