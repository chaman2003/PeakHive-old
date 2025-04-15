import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaUserPlus, FaSync, FaEye, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { fetchUsers, deleteUser, updateUser } from '../../api/adminApi';
import { motion } from 'framer-motion';
import { Modal, Button, Form } from 'react-bootstrap';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUsers(page, limit, searchTerm);
        setUsers(data.users || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
        setTotalUsers(data.total || 0);
        setLoading(false);
      } catch (err) {
        console.error('Error loading users:', err);
        setError(`Failed to load users: ${err.message}`);
        setLoading(false);
      }
    };

    loadUsers();
  }, [page, limit, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already triggered by the effect dependency
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all of their associated data (orders, reviews, etc.).')) {
      try {
        // Show loading message
        setError(null);
        setLoading(true);
        
        // Make the API call to delete the user
        await deleteUser(userId);
        
        // Success message
        alert('User deleted successfully');
        
        // Refresh the user list
        const data = await fetchUsers(page, limit, searchTerm);
        setUsers(data.users || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
        setTotalUsers(data.total || 0);
        
        setLoading(false);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(`Failed to delete user: ${err.message}`);
        setLoading(false);
      }
    }
  };

  const refreshUsers = async () => {
    try {
      setRefreshing(true);
      const data = await fetchUsers(page, limit, searchTerm);
      setUsers(data.users || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
      setTotalUsers(data.total || 0);
      setRefreshing(false);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Failed to refresh users.');
      setRefreshing(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Show user details modal
  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };
  
  // Show edit user modal
  const handleShowEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user'
    });
    setShowEditModal(true);
  };
  
  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  // Handle edit form submission
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make the API call to update the user
      await updateUser(selectedUser._id, editFormData);
      
      // Update the local state
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ...editFormData } 
          : user
      ));
      
      setShowEditModal(false);
      // Show success message
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">User Management</h2>
          <p className="text-muted">
            {totalUsers > 0 ? `${totalUsers} users found` : 'No users found'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary"
            onClick={refreshUsers}
            disabled={refreshing || loading}
            title="Refresh Users"
          >
            <FaSync className={refreshing ? "spinner me-1" : "me-1"} /> Refresh
          </button>
          <Link to="/admin/users/create" className="btn btn-primary">
            <FaUserPlus className="me-1" /> Add User
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-0 shadow-sm mb-4"
      >
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="btn btn-primary" type="submit">
                <FaSearch /> Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <motion.tr 
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={user.profileImage || 'https://via.placeholder.com/40'}
                              alt={`${user.firstName || ''} ${user.lastName || ''}`}
                              className="rounded-circle me-2"
                              width="40"
                              height="40"
                            />
                            <div>
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'Not provided'}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td>
                          {formatDate(user.createdAt)}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleShowDetails(user)}
                              title="View User Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleShowEditModal(user)}
                              title="Quick Edit User"
                            >
                              <FaEdit />
                            </button>
                            <Link
                              to={`/admin/users/edit/${user._id}`}
                              className="btn btn-sm btn-outline-secondary"
                              title="Full Edit User"
                            >
                              <FaUserCircle />
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user._id)}
                              title="Delete User"
                              disabled={user.role === 'admin'} // Prevent deleting admins
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="alert alert-info mb-0">
                          No users found. {searchTerm && 'Try a different search term.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages).keys()].map((pageNum) => (
                  <li
                    key={pageNum + 1}
                    className={`page-item ${page === pageNum + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(pageNum + 1)}
                    >
                      {pageNum + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </motion.div>
      
      {/* User Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                <img
                  src={selectedUser.profileImage || 'https://via.placeholder.com/150'}
                  alt={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
                  className="img-fluid rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <h5 className="mb-0">{selectedUser.firstName} {selectedUser.lastName}</h5>
                <p className="text-muted">{selectedUser.role || 'User'}</p>
              </div>
              <div className="col-md-8">
                <div className="card mb-3">
                  <div className="card-header">Basic Information</div>
                  <div className="card-body">
                    <div className="mb-2">
                      <strong>Email:</strong> {selectedUser.email}
                    </div>
                    <div className="mb-2">
                      <strong>Phone:</strong> {selectedUser.phone || 'Not provided'}
                    </div>
                    <div className="mb-2">
                      <strong>Joined:</strong> {formatDate(selectedUser.createdAt)}
                    </div>
                    <div className="mb-2">
                      <strong>Last Updated:</strong> {formatDate(selectedUser.updatedAt)}
                    </div>
                    <div className="mb-2">
                      <strong>User ID:</strong> <small className="text-muted">{selectedUser._id}</small>
                    </div>
                  </div>
                </div>
                
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className="card">
                    <div className="card-header">Addresses</div>
                    <div className="card-body">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={index} className="mb-2">
                          <strong>Address {index + 1}:</strong><br />
                          {address.street}, {address.city}, {address.state} {address.zip}, {address.country}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowDetailModal(false);
              handleShowEditModal(selectedUser);
            }}
          >
            Edit User
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={editFormData.role}
                onChange={handleEditFormChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default UserList; 