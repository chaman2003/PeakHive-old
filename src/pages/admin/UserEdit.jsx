import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaSave, FaArrowLeft } from 'react-icons/fa';
import { fetchUserById, updateUser } from '../../api/adminApi';
import { motion } from 'framer-motion';

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    profileImage: '',
    addresses: []
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Update to use the test database flag if needed
        const useTestDb = true; // Set to true to use test database
        
        // Use the direct fetchUserById function
        const userData = await fetchUserById(id, useTestDb);
        
        if (userData) {
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'user',
            profileImage: userData.profileImage || '',
            addresses: userData.addresses || []
          });
          console.log('Loaded phone from user details:', userData.phone || '[not set]');
        } else {
          setError('User not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Error loading user data. Please try again.');
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(false);
      
      console.log('Submitting user update with phone:', formData.phone);
      
      // Update user via API
      await updateUser(id, formData);
      
      setSuccess(true);
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    }
  };
  
  // Add a single address field
  const addAddressField = () => {
    setFormData({
      ...formData,
      addresses: [
        ...formData.addresses,
        { street: '', city: '', state: '', zip: '', country: '' }
      ]
    });
  };
  
  // Update an address field
  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      addresses: updatedAddresses
    });
  };
  
  // Remove an address
  const removeAddress = (index) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses.splice(index, 1);
    
    setFormData({
      ...formData,
      addresses: updatedAddresses
    });
  };

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Edit User</h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/admin/users')}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" /> Back to Users
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">User updated successfully!</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading user data...</p>
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUser />
                        </span>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope />
                        </span>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaPhone />
                        </span>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaShieldAlt />
                        </span>
                        <Form.Select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Profile Image URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <h4 className="mt-4 mb-3">Addresses</h4>
                
                {formData.addresses.map((address, index) => (
                  <Card key={index} className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <h5 className="card-title">Address {index + 1}</h5>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeAddress(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Street</Form.Label>
                            <Form.Control
                              type="text"
                              value={address.street || ''}
                              onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              type="text"
                              value={address.city || ''}
                              onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>State</Form.Label>
                            <Form.Control
                              type="text"
                              value={address.state || ''}
                              onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>ZIP Code</Form.Label>
                            <Form.Control
                              type="text"
                              value={address.zip || ''}
                              onChange={(e) => handleAddressChange(index, 'zip', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                              type="text"
                              value={address.country || ''}
                              onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
                
                <Button 
                  variant="outline-primary" 
                  onClick={addAddressField} 
                  className="mb-4"
                >
                  Add Address
                </Button>
                
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" className="d-flex align-items-center justify-content-center">
                    <FaSave className="me-2" /> Save Changes
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

export default UserEdit; 