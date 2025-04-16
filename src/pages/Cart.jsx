import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartQuantity, syncCartWithDatabase, applyCouponCode, clearCouponCode } from '../slices/cartSlice';
import { createSelector } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

// Create memoized selectors
const selectCartItems = createSelector(
  [(state) => state.cart.cartItems, 
   (state) => state.cart.couponCode, 
   (state) => state.cart.discount,
   (state) => state.cart.shipping],
  (cartItems, couponCode, discount, shipping) => ({ 
    cartItems, 
    couponCode, 
    discount,
    shipping 
  })
);

const selectUserInfo = createSelector(
  [(state) => state.user.userInfo],
  (userInfo) => ({ userInfo })
);

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for coupon input
  const [couponInput, setCouponInput] = useState('');
  
  // Get cart items from Redux store using memoized selectors
  const { cartItems = [], couponCode = '', discount = 0, shipping = 0 } = useSelector(selectCartItems);
  const { userInfo } = useSelector(selectUserInfo);
  
  // Calculate subtotal with safety checks
  const subtotal = Array.isArray(cartItems) 
    ? cartItems.reduce((total, item) => total + (Number(item.price || 0) * Number(item.quantity || 0)), 0) 
    : 0;
  const discountAmount = discount ? subtotal * Number(discount) : 0;
  const safeShipping = Number(shipping || 0);
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + safeShipping + tax;
  
  // Add useEffect to sync cart after any changes
  useEffect(() => {
    if (userInfo && cartItems.length > 0) {
      dispatch(syncCartWithDatabase());
    }
  }, [dispatch, userInfo, cartItems]);
  
  // Initialize coupon input from Redux state
  useEffect(() => {
    if (couponCode) {
      setCouponInput(couponCode);
    }
  }, [couponCode]);
  
  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
    // syncCartWithDatabase will be called by the useEffect
  };
  
  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(updateCartQuantity({ productId, quantity }));
    // syncCartWithDatabase will be called by the useEffect
  };
  
  const handleApplyCoupon = () => {
    if (!couponInput) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    if (couponInput === 'discount50') {
      dispatch(applyCouponCode(couponInput));
      toast.success('Coupon applied successfully! 50% discount added.');
    } else {
      toast.error('Invalid coupon code');
      dispatch(clearCouponCode());
    }
  };
  
  const handleRemoveCoupon = () => {
    dispatch(clearCouponCode());
    setCouponInput('');
    toast.info('Coupon removed');
  };
  
  const handleCheckout = () => {
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }
    
    // For logged out users, redirect to login with checkout redirect
    if (!userInfo) {
      // Store a flag indicating checkout was initiated
      localStorage.setItem('checkoutInitiated', 'true');
      navigate('/login?redirect=checkout');
    } else {
      // Store a flag indicating checkout was initiated
      localStorage.setItem('checkoutInitiated', 'true');
      // Ensure cart is synced before going to checkout
      dispatch(syncCartWithDatabase())
        .then(() => {
          console.log('Cart synced successfully, proceeding to checkout');
          navigate('/checkout');
        })
        .catch(error => {
          console.error('Error syncing cart:', error);
          // Still proceed to checkout even if sync fails
          navigate('/checkout');
        });
    }
  };
  
  const handleContinueShopping = () => {
    navigate('/products');
  };
  
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
                      <div key={item.productId} className="row align-items-center mb-4 pb-3 border-bottom">
                        <div className="col-md-2">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="img-fluid rounded"
                          />
                        </div>
                        <div className="col-md-5">
                          <h5 className="mb-1">{item.name}</h5>
                          <p className="text-muted mb-0">SKU: TECH-{item.productId}</p>
                        </div>
                        <div className="col-md-2">
                          <div className="input-group input-group-sm">
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => item.quantity > 1 && handleUpdateQuantity(item.productId, item.quantity - 1)}
                            >-</button>
                            <input 
                              type="text" 
                              className="form-control text-center" 
                              value={item.quantity}
                              readOnly 
                            />
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => item.quantity < item.stock && handleUpdateQuantity(item.productId, item.quantity + 1)}
                            >+</button>
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <p className="fw-bold mb-0">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="col-md-1 text-end">
                          <button 
                            className="btn btn-sm text-danger"
                            onClick={() => handleRemoveFromCart(item.productId)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="input-group" style={{ maxWidth: '300px' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Discount code" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                        />
                        {couponCode ? (
                          <button 
                            className="btn btn-outline-danger"
                            onClick={handleRemoveCoupon}
                          >
                            Remove
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary"
                            onClick={handleApplyCoupon}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={handleContinueShopping}
                      >
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
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={handleContinueShopping}
                  >
                    Start Shopping
                  </button>
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
                  
                  {discount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount ({discount * 100}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>{cartItems.length === 0 ? '$0.00' : `$${safeShipping.toFixed(2)}`}</span>
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
                    <button 
                      className="btn btn-primary btn-lg mb-3"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </button>
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
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => navigate('/contact')}
                  >
                    Contact Support
                  </button>
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