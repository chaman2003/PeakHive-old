import React from 'react';

function Profile() {
  // Mock user data
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg'
  };
  
  // Mock orders
  const orders = [
    {
      id: 'ORD-1234567',
      date: '2023-06-15',
      status: 'Delivered',
      total: 1499.98,
      items: 2
    },
    {
      id: 'ORD-7654321',
      date: '2023-05-22',
      status: 'Processing',
      total: 699.99,
      items: 1
    }
  ];
  
  return (
    <>
      <div className="container py-5">
        <h1 className="fw-bold mb-5">My Account</h1>
        
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center py-4">
                <img 
                  src={user.avatar} 
                  alt={`${user.firstName} ${user.lastName}`} 
                  className="rounded-circle mb-3"
                  width="100"
                  height="100"
                />
                <h5 className="fw-bold mb-1">{user.firstName} {user.lastName}</h5>
                <p className="text-muted mb-0">{user.email}</p>
              </div>
            </div>
            
            <div className="list-group list-group-flush shadow-sm mb-4">
              <a href="#" className="list-group-item list-group-item-action active">
                <i className="bi bi-person me-2"></i>Profile
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                <i className="bi bi-bag me-2"></i>Orders
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                <i className="bi bi-heart me-2"></i>Wishlist
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                <i className="bi bi-geo-alt me-2"></i>Addresses
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                <i className="bi bi-credit-card me-2"></i>Payment Methods
              </a>
              <a href="#" className="list-group-item list-group-item-action text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Sign Out
              </a>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">Profile Information</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="firstName" 
                        defaultValue={user.firstName}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="lastName" 
                        defaultValue={user.lastName}
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        defaultValue={user.email}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="phone" 
                        defaultValue={user.phone}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary">Update Profile</button>
                </form>
              </div>
            </div>
            
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Recent Orders</h5>
                <a href="#" className="btn btn-outline-primary btn-sm">View All</a>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.date}</td>
                          <td>
                            <span className={`badge ${order.status === 'Delivered' ? 'bg-success' : 'bg-primary'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            <a href="#" className="btn btn-sm btn-outline-secondary">Details</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">Security</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="currentPassword" 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="newPassword" 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="confirmPassword" 
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary">Change Password</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile; 