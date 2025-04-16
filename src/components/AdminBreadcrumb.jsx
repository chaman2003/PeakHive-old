import React from 'react';
import { Link } from 'react-router-dom';

const AdminBreadcrumb = ({ entity }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        {entity && (
          <li className="breadcrumb-item active" aria-current="page">
            {entity}
          </li>
        )}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumb; 