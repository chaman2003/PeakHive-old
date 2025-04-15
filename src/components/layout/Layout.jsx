import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminSidebar from '../admin/AdminSidebar';

function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 py-4 bg-light">
        {isAdminRoute ? (
          <div className="container-fluid px-4 px-md-5">
            <div className="row">
              <div className="col-md-3 col-lg-2 d-none d-md-block">
                <AdminSidebar />
                <div style={{ height: '410px' }}></div>
              </div>
              <div className="col-md-9 col-lg-10">
                {children}
              </div>
            </div>
          </div>
        ) : (
          <div className="container-fluid px-4 px-md-5">
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Layout; 