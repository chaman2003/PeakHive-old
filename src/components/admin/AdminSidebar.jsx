import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaChartPie, 
  FaUsers, 
  FaShoppingBag, 
  FaClipboardList, 
  FaComments,
  FaEnvelope
} from 'react-icons/fa';

function AdminSidebar() {
  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartPie /> },
    { path: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { path: '/admin/products', label: 'Products', icon: <FaShoppingBag /> },
    { path: '/admin/orders', label: 'Orders', icon: <FaClipboardList /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <FaComments /> },
    { path: '/admin/messages', label: 'Contact Messages', icon: <FaEnvelope /> },
  ];

  return (
    <div 
      className="card border-0 shadow-sm position-fixed" 
      style={{ 
        top: '4.5rem',
        width: 'inherit',
        maxWidth: 'calc(16.666% - 20px)', // Adjust width to match col-lg-2 width minus padding
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}
    >
      <div className="card-header bg-primary text-white py-3">
        <h5 className="mb-0 fw-bold text-center">Admin Panel</h5>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {adminLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `list-group-item list-group-item-action border-0 d-flex align-items-center py-3 ${
                  isActive ? 'active bg-light fw-bold text-primary border-start border-4 border-primary' : 'text-dark'
                }`
              }
              style={{
                transition: 'all 0.2s ease'
              }}
            >
              <span className="me-3 fs-5">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar; 