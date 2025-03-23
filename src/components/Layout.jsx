import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 py-4 bg-light">
        <div className="container-fluid px-4 px-md-5">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout; 