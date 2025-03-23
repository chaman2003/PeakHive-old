import React from 'react';

function Cart() {
  // Mock cart data
  const cartItems = [
    {
      id: 3,
      name: 'Ultra Slim Laptop',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
      quantity: 1
    },
    {
      id: 1,
      name: 'Premium Headphones',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1165&q=80',
      quantity: 2
    }
  ];
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <div className="container-fluid py-5 flex-grow-1">
          <h1 className="fw-bold mb-4">Your Cart</h1>
          
          <div className="row g-5">
            <div className="col-lg-8">
              {cartItems.length > 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    {cartItems.map((item) => (
                      <div key={item.id} className="row align-items-center mb-4 pb-3 border-bottom">
                        <div className="col-md-2">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="img-fluid rounded"
                          />
                        </div>
                        <div className="col-md-5">
                          <h5 className="mb-1">{item.name}</h5>
                          <p className="text-muted mb-0">SKU: TECH-{item.id}000{item.id}</p>
                        </div>
                        <div className="col-md-2">
                          <div className="input-group input-group-sm">
                            <button className="btn btn-outline-secondary">-</button>
                            <input type="text" className="form-control text-center" value={item.quantity} readOnly />
                            <button className="btn btn-outline-secondary">+</button>
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <p className="fw-bold mb-0">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="col-md-1 text-end">
                          <button className="btn btn-sm text-danger">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="input-group" style={{ maxWidth: '300px' }}>
                        <input type="text" className="form-control" placeholder="Promo code" />
                        <button className="btn btn-secondary">Apply</button>
                      </div>
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
                  <h3>Your cart is empty</h3>
                  <p className="text-muted">Looks like you haven't added any products to your cart yet.</p>
                  <a href="/products" className="btn btn-primary mt-3">Start Shopping</a>
                </div>
              )}
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Order Summary</h5>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-4">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold fs-5">${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-grid">
                    <button className="btn btn-primary btn-lg mb-3">Proceed to Checkout</button>
                    <div className="text-center">
                      <span><i className="bi bi-shield-lock me-1"></i>Secure Checkout</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 d-flex justify-content-center">
                    <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-medium.png" alt="PayPal" className="me-2" height="30" />
                    <img src="https://cdn.iconscout.com/icon/free/png-256/free-visa-3-226460.png" alt="Visa" className="me-2" height="30" />
                    <img src="https://cdn.iconscout.com/icon/free/png-256/free-mastercard-3-226462.png" alt="Mastercard" className="me-2" height="30" />
                    <img src="https://cdn.iconscout.com/icon/free/png-256/free-american-express-51-675784.png" alt="American Express" height="30" />
                  </div>
                </div>
              </div>
              
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Need Help?</h5>
                  <p className="mb-2"><i className="bi bi-question-circle me-2"></i>Have questions about your order?</p>
                  <a href="/contact" className="btn btn-outline-secondary w-100">Contact Support</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart; 