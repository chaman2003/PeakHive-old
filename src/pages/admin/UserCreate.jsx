import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Row, Col, Image } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowLeft, FaShieldAlt, FaSave, FaRandom } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { register } from '../../api/adminApi';

function UserCreate() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    profileImage: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Avatar API options
  const avatarTypes = [
    { type: 'personas', backgroundColor: 'f5f5f5' },
    { type: 'avataaars', hairColor: '2c1b18', skinColor: 'f2d3b1' },
    { type: 'bottts', colors: ['indigo', 'blue', 'cyan', 'teal', 'green'] },
    { type: 'shapes', colors: ['0096c7', '023e8a'] },
    { type: 'identicon', backgroundColor: 'f8f9fa' }
  ];
  
  // Generate a random avatar from DiceBear API
  const generateRandomAvatar = () => {
    // Pick a random avatar type
    const randomType = avatarTypes[Math.floor(Math.random() * avatarTypes.length)];
    const seed = `User${Math.floor(Math.random() * 10000)}`;
    
    let url = `https://api.dicebear.com/7.x/${randomType.type}/svg?seed=${seed}`;
    
    // Add type-specific parameters
    if (randomType.type === 'personas' || randomType.type === 'identicon') {
      url += `&backgroundColor=${randomType.backgroundColor}`;
    } else if (randomType.type === 'avataaars') {
      url += `&hairColor=${randomType.hairColor}&skinColor=${randomType.skinColor}`;
    } else if (randomType.type === 'bottts') {
      const randomColor = randomType.colors[Math.floor(Math.random() * randomType.colors.length)];
      url += `&colors[]=${randomColor}`;
    } else if (randomType.type === 'shapes') {
      url += `&colors[]=${randomType.colors[0]},${randomType.colors[1]}`;
    }
    
    return url;
  };
  
  // Set a random avatar when component mounts
  useEffect(() => {
    const randomAvatar = generateRandomAvatar();
    setFormData(prev => ({
      ...prev,
      profileImage: randomAvatar
    }));
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Generate a new random avatar
  const handleGenerateAvatar = () => {
    const newAvatar = generateRandomAvatar();
    setFormData(prev => ({
      ...prev,
      profileImage: newAvatar
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create user
      await register(formData);
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred while creating the user');
    }
  };

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Create New User</h2>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/admin/users')}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" /> Back to Users
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">User created successfully!</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Creating user...</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
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
                          placeholder="Enter first name"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUser />
                        </span>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter last name"
                        />
                      </div>
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
                          placeholder="Enter email address"
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
                          placeholder="Enter phone number"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter password"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          placeholder="Confirm password"
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
                      <Form.Label>Profile Image</Form.Label>
                      <div className="d-flex mb-2 align-items-center">
                        {formData.profileImage && (
                          <Image 
                            src={formData.profileImage} 
                            roundedCircle 
                            style={{ width: '60px', height: '60px', marginRight: '15px' }} 
                            className="border"
                          />
                        )}
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={handleGenerateAvatar}
                          className="d-flex align-items-center"
                        >
                          <FaRandom className="me-1" /> Generate Random Avatar
                        </Button>
                      </div>
                      <Form.Control
                        type="text"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleInputChange}
                        placeholder="Or enter custom URL"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => navigate('/admin/users')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className="d-flex align-items-center"
                    disabled={loading}
                  >
                    <FaSave className="me-2" /> Create User
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default UserCreate; 