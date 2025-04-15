import React, { useState, useEffect } from 'react';
import { 
  fetchContactMessages, 
  deleteContactMessage, 
  updateContactMessage 
} from '../../api/adminApi';
import { 
  FaEnvelope, 
  FaSearch, 
  FaTrash, 
  FaEye, 
  FaSync, 
  FaCheck, 
  FaRegEnvelope, 
  FaRegEnvelopeOpen 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

function ContactMessageList() {
  // State
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [limit] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchContactMessages(page, limit, filterStatus);
        
        setMessages(data.messages || []);
        setTotalPages(Math.ceil((data.total || 0) / limit));
        setTotalMessages(data.total || 0);
        setLoading(false);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(`Failed to load messages: ${err.message}`);
        setLoading(false);
      }
    };

    loadMessages();
  }, [page, limit, filterStatus]);

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality (you'll need to add search parameter to your API)
    console.log('Search for:', searchTerm);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  // Refresh messages
  const refreshMessages = async () => {
    try {
      setRefreshing(true);
      
      const data = await fetchContactMessages(page, limit, filterStatus);
      
      setMessages(data.messages || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
      setTotalMessages(data.total || 0);
      setRefreshing(false);
      toast.success('Messages refreshed');
    } catch (err) {
      console.error('Error refreshing messages:', err);
      setError('Failed to refresh messages.');
      setRefreshing(false);
      toast.error('Failed to refresh messages');
    }
  };
  
  // Show message details modal
  const handleShowDetails = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // If message is unread, mark it as read
    if (message.status === 'unread') {
      updateMessageStatus(message._id, 'read');
    }
  };
  
  // Show delete confirmation modal
  const handleShowDeleteModal = (message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };
  
  // Update message status
  const updateMessageStatus = async (messageId, status) => {
    try {
      await updateContactMessage(messageId, { status });
      
      // Update local state
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, status } : msg
      ));
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      
      toast.success(`Message marked as ${status}`);
    } catch (err) {
      console.error('Error updating message status:', err);
      toast.error('Failed to update message status');
    }
  };
  
  // Delete message
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      setDeleteLoading(true);
      
      await deleteContactMessage(selectedMessage._id);
      
      // Update local state
      setMessages(messages.filter(msg => msg._id !== selectedMessage._id));
      setTotalMessages(prev => prev - 1);
      
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setSelectedMessage(null);
      
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      setDeleteLoading(false);
      toast.error('Failed to delete message');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread':
        return <Badge bg="danger">Unread</Badge>;
      case 'read':
        return <Badge bg="primary">Read</Badge>;
      case 'responded':
        return <Badge bg="success">Responded</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread':
        return <FaRegEnvelope className="text-danger" />;
      case 'read':
        return <FaRegEnvelopeOpen className="text-primary" />;
      case 'responded':
        return <FaCheck className="text-success" />;
      default:
        return <FaEnvelope />;
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Contact Messages</h2>
          <p className="text-muted">
            {totalMessages > 0 ? `${totalMessages} messages found` : 'No messages found'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary"
            onClick={refreshMessages}
            disabled={refreshing || loading}
            title="Refresh Messages"
          >
            <FaSync className={refreshing ? "spinner me-1" : "me-1"} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-0 shadow-sm mb-4"
      >
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button className="btn btn-primary" type="submit">
                    <FaSearch /> Search
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-md-end mt-3 mt-md-0">
                <Form.Select 
                  onChange={handleFilterChange} 
                  value={filterStatus}
                  className="w-auto"
                >
                  <option value="">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                </Form.Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading messages...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <motion.tr 
                        key={message._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="align-middle">
                          {getStatusIcon(message.status)} {getStatusBadge(message.status)}
                        </td>
                        <td className="align-middle">
                          {message.name}
                        </td>
                        <td className="align-middle">
                          {message.email}
                        </td>
                        <td className="align-middle">
                          {message.subject}
                        </td>
                        <td className="align-middle">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="align-middle">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleShowDetails(message)}
                              title="View Message"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleShowDeleteModal(message)}
                              title="Delete Message"
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
                          No messages found. {filterStatus && 'Try a different filter.'}
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
      
      {/* Message Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEnvelope className="me-2 text-primary" />
            Message Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessage && (
            <div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">{selectedMessage.subject}</h5>
                <div>{getStatusBadge(selectedMessage.status)}</div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <p className="mb-1"><strong>From:</strong> {selectedMessage.name}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedMessage.email}</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <p className="mb-1"><strong>Received:</strong> {formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>
              
              <div className="card bg-light">
                <div className="card-body">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            {selectedMessage && (
              <div className="btn-group">
                <Button 
                  variant="outline-primary" 
                  onClick={() => updateMessageStatus(selectedMessage._id, 'read')}
                  disabled={selectedMessage.status === 'read'}
                >
                  <FaRegEnvelopeOpen className="me-1" /> Mark as Read
                </Button>
                <Button 
                  variant="outline-success" 
                  onClick={() => updateMessageStatus(selectedMessage._id, 'responded')}
                  disabled={selectedMessage.status === 'responded'}
                >
                  <FaCheck className="me-1" /> Mark as Responded
                </Button>
              </div>
            )}
          </div>
          <div>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this message from{' '}
          <strong>{selectedMessage?.name}</strong>?
          <div className="mt-2 alert alert-warning">
            <small>This action cannot be undone.</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteMessage}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" /> Delete Message
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ContactMessageList; 