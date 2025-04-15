import React from 'react';

function PageBanner({ title, subtitle }) {
  return (
    <div className="bg-primary bg-gradient py-5 mb-4">
      <div className="container py-4">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h1 className="display-4 fw-bold text-white mb-3">{title}</h1>
            {subtitle && (
              <p className="lead text-white-75 mb-0">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageBanner; 