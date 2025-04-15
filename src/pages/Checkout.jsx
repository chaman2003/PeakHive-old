import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder, processPayment, generateInvoice, resetOrderSuccess, resetPaymentSuccess, resetInvoiceSuccess } from '../slices/orderSlice';
import { clearCart, clearCartWithServer } from '../slices/cartSlice';
import { getUserDetails } from '../slices/userSlice';
import { FaCheckCircle, FaArrowLeft, FaArrowRight, FaFileInvoice, FaPrint, FaDownload, FaShippingFast, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get cart items and user info from Redux store
  const { cartItems, couponCode, discount } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const { userDetails } = useSelector((state) => state.user);
  const { 
    order, 
    loading, 
    success, 
    paymentSuccess, 
    invoiceSuccess, 
    invoice, 
    error 
  } = useSelector((state) => state.order);
  
  // State for checkout steps
  const [activeStep, setActiveStep] = useState(1);
  
  // Add state to track order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add a state to track if order was successfully placed
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // States for form inputs
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = discount ? subtotal * discount : 0;
  // Always apply $10 shipping charge if there are items in the cart
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + shipping + tax;
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Handle shipping form change
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value
    });
  };
  
  // Handle payment details change
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value
    });
  };
  
  // Handle step navigation
  const goToStep = (step) => {
    // Only allow going to steps that are accessible
    if (step === 1) {
      setActiveStep(1);
    } else if (step === 2 && (activeStep >= 2 || validateShippingForm())) {
      setActiveStep(2);
    } else if (step === 3 && success && order) {
      setActiveStep(3);
    } else if (step === 4 && paymentSuccess) {
      setActiveStep(4);
    }
  };
  
  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  
  // Validate shipping form without submission
  const validateShippingForm = () => {
    return (
      shippingAddress.street && 
      shippingAddress.city && 
      shippingAddress.state && 
      shippingAddress.zip && 
      shippingAddress.country
    );
  };
  
  // Handle shipping form submission
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShippingForm()) {
      nextStep();
    } else {
      alert('Please fill all required fields');
    }
  };
  
  // Handle payment form submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Validate payment details based on payment method
    if (paymentMethod === 'creditCard') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardName || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        alert('Please fill all card details');
        return;
      }
    }
    
    // Set submitting state to true before placing order
    setIsSubmitting(true);
    handlePlaceOrder();
  };
  
  // Handle place order
  const handlePlaceOrder = () => {
    // Ensure cart items exist
    if (!cartItems || cartItems.length === 0) {
      console.error('No items in cart');
      alert('Your cart is empty. Please add items before checkout.');
      setIsSubmitting(false);
      navigate('/cart');
      return;
    }
    
    try {
      // Create order object with properly formatted items
      const orderData = {
        orderItems: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        discountCode: couponCode || '',
        discountAmount: discountAmount,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      };
      
      console.log('Submitting order:', orderData);
      
      // Dispatch create order action
      dispatch(createOrder(orderData));
    } catch (error) {
      console.error('Error creating order:', error);
      alert('There was an error processing your order. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle payment processing
  const handleProcessPayment = useCallback(() => {
    if (order && order._id) {
      console.log('Processing payment for order:', order._id);
      
      // Show loading indicator
      setIsSubmitting(true);
      
      dispatch(processPayment({ 
        orderId: order._id, 
        paymentDetails: {
          method: paymentMethod,
          details: paymentMethod === 'creditCard' ? paymentDetails : null,
          amount: total
        }
      }));
    } else {
      console.error('Cannot process payment: No order found');
    }
  }, [dispatch, order, paymentMethod, paymentDetails, total]);
  
  // Handle invoice generation
  const handleGenerateInvoice = useCallback(() => {
    if (order && order._id) {
      console.log('Generating invoice for order:', order._id);
      dispatch(generateInvoice(order._id));
    }
  }, [dispatch, order]);
  
  // Modified: Check for empty cart but don't redirect if order was just placed or is being submitted
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
      return;
    }
    
    // Only redirect for empty cart if we haven't just placed an order and not submitting
    if ((!cartItems || cartItems.length === 0) && !orderPlaced && !success && !isSubmitting && !loading) {
      console.log('No items in cart, redirecting to cart page');
      navigate('/cart');
    }
  }, [userInfo, cartItems, navigate, orderPlaced, success, isSubmitting, loading]);
  
  // Initialize address from user info if available and fetch user details
  useEffect(() => {
    // Fetch user details to ensure we have the most current address information
    if (userInfo && userInfo._id) {
      console.log("Fetching latest user details for checkout...");
      dispatch(getUserDetails('profile'));
    }
    
    if (userInfo) {
      console.log("Loading addresses from userInfo:", userInfo);
      
      // Check if addresses exist and handle different data structures
      if (userInfo.addresses) {
        let primaryAddress;
        
        if (Array.isArray(userInfo.addresses) && userInfo.addresses.length > 0) {
          // If it's an array, use the first address
          primaryAddress = userInfo.addresses[0];
        } else if (typeof userInfo.addresses === 'object' && Object.keys(userInfo.addresses).length > 0) {
          // If it's an object, get the first address value
          primaryAddress = Object.values(userInfo.addresses)[0];
        }
        
        if (primaryAddress) {
          console.log("Setting primary address:", primaryAddress);
          setShippingAddress({
            street: primaryAddress.street || '',
            city: primaryAddress.city || '',
            state: primaryAddress.state || '',
            zip: primaryAddress.zip || '',
            country: primaryAddress.country || 'United States'
          });
        }
      }
    }
  }, [userInfo, dispatch]);
  
  // Handle successful order placement - modify to prevent automatic payment processing
  useEffect(() => {
    if (success && order && order._id) {
      // Mark that an order was placed
      setOrderPlaced(true);
      // Reset the submission state
      setIsSubmitting(false);
      
      // Set active step to show confirmation
      setActiveStep(3);
      
      console.log('Order created successfully:', order);
      
      // Do NOT automatically process payment here - let user see confirmation first
    }
  }, [success, order]);
  
  // Add this effect to clear cart after confirmation and invoice
  useEffect(() => {
    // After invoice is generated and we're marked as orderPlaced
    if (invoiceSuccess && invoice && orderPlaced) {
      // Use new function to clear cart both locally and on server
      dispatch(clearCartWithServer())
        .then(() => {
          console.log('Cart cleared successfully');
        })
        .catch(err => {
          console.error('Error clearing cart:', err);
          // Fallback to local clear if server sync fails
          dispatch(clearCart());
        });
    }
  }, [invoiceSuccess, invoice, dispatch, orderPlaced]);
  
  // Modified: Load cart items from localStorage on component mount
  useEffect(() => {
    // Skip this check if we're in the process of submitting or have placed an order
    if (isSubmitting || orderPlaced || success) {
      return;
    }
    
    const storedCartItems = localStorage.getItem('cartItems');
    if (!storedCartItems || JSON.parse(storedCartItems).length === 0) {
      console.log('No items in localStorage, redirecting to cart');
      navigate('/cart');
    }
  }, [navigate, isSubmitting, orderPlaced, success]);
  
  // Error handling to reset isSubmitting state
  useEffect(() => {
    if (error && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [error, isSubmitting]);
  
  // Go to invoice step when payment is processed
  useEffect(() => {
    if (paymentSuccess && order) {
      // Reset loading state
      setIsSubmitting(false);
      
      // Move to invoice step
      setActiveStep(4);
      
      // Generate invoice
      handleGenerateInvoice();
      console.log('Payment successful, generating invoice');
    }
  }, [paymentSuccess, order, handleGenerateInvoice]);
  
  // Add a cleanup function when component unmounts
  useEffect(() => {
    return () => {
      // Reset order states when leaving checkout page
      dispatch(resetOrderSuccess());
      dispatch(resetPaymentSuccess());
      dispatch(resetInvoiceSuccess());
    };
  }, [dispatch]);
  
  // Improve going back from invoice to confirmation
  const handleBackToConfirmation = () => {
    // Reset payment success state when going back to confirmation
    dispatch(resetPaymentSuccess());
    setActiveStep(3);
  };
  
  // Render shipping form
  const renderShippingForm = () => {
    // Show comprehensive debug info of both user objects
    console.log("User info in checkout:", JSON.stringify(userInfo, null, 2));
    console.log("User details in checkout:", JSON.stringify(userDetails, null, 2));
    
    // Try to get addresses from multiple possible sources
    let addressesArray = [];
    
    // First check userDetails.user.addresses (from getUserDetails API call)
    if (userDetails && userDetails.user && userDetails.user.addresses) {
      if (Array.isArray(userDetails.user.addresses)) {
        addressesArray = userDetails.user.addresses;
      } else if (typeof userDetails.user.addresses === 'object') {
        addressesArray = Object.values(userDetails.user.addresses);
      }
    } 
    // Fallback to userInfo.addresses
    else if (userInfo && userInfo.addresses) {
      if (Array.isArray(userInfo.addresses)) {
        addressesArray = userInfo.addresses;
      } else if (typeof userInfo.addresses === 'object') {
        addressesArray = Object.values(userInfo.addresses);
      }
    }
    
    console.log("Addresses available for selection:", addressesArray);
       
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title mb-4">
            <FaShippingFast className="me-2 text-primary" />
            Shipping Information
          </h3>
          
          {/* Saved Addresses Section */}
          {addressesArray && addressesArray.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-3">Your Saved Addresses ({addressesArray.length})</h5>
              <div className="row g-3">
                {addressesArray.map((address, index) => (
                  <div className="col-md-6" key={index}>
                    <div className={`card h-100 ${shippingAddress.street === address.street ? 'border-primary' : 'border'}`}>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-bold">Address {index + 1}</h6>
                          <button 
                            type="button" 
                            className={`btn btn-sm ${shippingAddress.street === address.street ? 'btn-success' : 'btn-primary'}`}
                            onClick={() => {
                              try {
                                console.log("Selected address:", address);
                                setShippingAddress({
                                  street: address.street || '',
                                  city: address.city || '',
                                  state: address.state || '',
                                  zip: address.zip || '',
                                  country: address.country || 'United States'
                                });
                                toast.success(`Address ${index + 1} selected for shipping`);
                              } catch (err) {
                                console.error("Error selecting address:", err);
                                toast.error("Failed to select address");
                              }
                            }}
                          >
                            {shippingAddress.street === address.street ? 'Selected' : 'Use This'}
                          </button>
                        </div>
                        <address className="mb-0 small">
                          {address.street}<br />
                          {address.city}, {address.state} {address.zip}<br />
                          {address.country}
                        </address>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 mb-4">
                <div className="border-top pt-3">
                  <p className="text-muted fw-medium fs-5">Or enter a new address below</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleShippingSubmit}>
            <div className="mb-3">
              <label htmlFor="street" className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-control"
                id="street"
                name="street"
                value={shippingAddress.street}
                onChange={handleShippingChange}
                required
              />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="city" className="form-label">City *</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="state" className="form-label">State/Province *</label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="zip" className="form-label">Postal/ZIP Code *</label>
                <input
                  type="text"
                  className="form-control"
                  id="zip"
                  name="zip"
                  value={shippingAddress.zip}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="country" className="form-label">Country *</label>
                <select
                  className="form-select"
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleShippingChange}
                  required
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                </select>
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4">
              <Link to="/cart" className="btn btn-outline-secondary me-2">
                <FaArrowLeft className="me-1" /> Back to Cart
              </Link>
              <button type="submit" className="btn btn-primary">
                Continue to Payment <FaArrowRight className="ms-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Render payment form
  const renderPaymentForm = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h3 className="card-title mb-4">
          <FaCreditCard className="me-2 text-primary" />
          Payment Method
        </h3>
        <form onSubmit={handlePaymentSubmit}>
          <div className="mb-4">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethod"
                id="creditCard"
                value="creditCard"
                checked={paymentMethod === 'creditCard'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label className="form-check-label" htmlFor="creditCard">
                Credit / Debit Card
              </label>
            </div>
            
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethod"
                id="paypal"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label className="form-check-label" htmlFor="paypal">
                PayPal
              </label>
            </div>
            
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethod"
                id="bankTransfer"
                value="bankTransfer"
                checked={paymentMethod === 'bankTransfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label className="form-check-label" htmlFor="bankTransfer">
                Bank Transfer
              </label>
            </div>
          </div>
          
          {paymentMethod === 'creditCard' && (
            <div className="card bg-light border">
              <div className="card-body">
                <h5 className="mb-3">Card Details</h5>
                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">Card Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={paymentDetails.cardNumber}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="cardName" className="form-label">Cardholder Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="cardName"
                    name="cardName"
                    placeholder="Name on card"
                    value={paymentDetails.cardName}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="expiryDate" className="form-label">Expiry Date *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="cvv" className="form-label">CVV *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === 'paypal' && (
            <div className="alert alert-info">
              You will be redirected to PayPal to complete your payment after placing your order.
            </div>
          )}
          
          {paymentMethod === 'bankTransfer' && (
            <div className="alert alert-info">
              Bank account details will be provided after placing your order.
            </div>
          )}
          
          <div className="d-flex justify-content-between mt-4">
            <button type="button" onClick={prevStep} className="btn btn-outline-secondary">
              <FaArrowLeft className="me-1" /> Back to Shipping
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>Place Order <FaArrowRight className="ms-1" /></>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <small className="text-muted d-flex align-items-center justify-content-center">
            <FaShieldAlt className="me-1" /> Your payment information is secure and encrypted
          </small>
        </div>
      </div>
    </div>
  );
  
  // Render order confirmation with correct pricing from order object
  const renderOrderConfirmation = () => {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="text-center mb-4">
            <FaCheckCircle className="text-success" size={60} />
            <h3 className="mt-3">Order Confirmed!</h3>
            <p className="text-muted">Your order has been placed successfully.</p>
          </div>
          
          <div className="order-details p-3 bg-light rounded mb-4">
            <h5 className="fw-bold mb-3">Order Details</h5>
            
            <div className="row mb-2">
              <div className="col-4 text-muted">Order Number:</div>
              <div className="col-8 fw-bold">{order ? order._id : 'Pending...'}</div>
            </div>
            
            <div className="row mb-2">
              <div className="col-4 text-muted">Date:</div>
              <div className="col-8">{order ? new Date(order.createdAt).toLocaleDateString() : 'Pending...'}</div>
            </div>
            
            <div className="row mb-2">
              <div className="col-4 text-muted">Total:</div>
              <div className="col-8 fw-bold">{order ? formatCurrency(order.totalPrice) : formatCurrency(total)}</div>
            </div>
            
            <div className="row mb-2">
              <div className="col-4 text-muted">Shipping Address:</div>
              <div className="col-8">
                {order ? (
                  <>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zip}, {order.shippingAddress.country}
                  </>
                ) : (
                  <>
                    {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state}, {shippingAddress.zip}, {shippingAddress.country}
                  </>
                )}
              </div>
            </div>
            
            {(couponCode || (order && order.discountCode)) && (
              <div className="row mb-2">
                <div className="col-4 text-muted">Discount Applied:</div>
                <div className="col-8 text-success">
                  {order ? `${order.discountCode} (${formatCurrency(order.discountAmount)})` : `${couponCode} (${formatCurrency(discountAmount)})`}
                </div>
              </div>
            )}
          </div>
          
          {paymentSuccess ? (
            <button 
              onClick={() => goToStep(4)} 
              className="btn btn-lg btn-primary mb-3 w-100"
            >
              <FaFileInvoice className="me-2" />
              View Invoice
            </button>
          ) : (
            <button 
              onClick={handleProcessPayment} 
              className="btn btn-lg btn-primary mb-3 w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing Payment...
                </>
              ) : (
                <>
                  <FaCreditCard className="me-2" />
                  Process Payment
                </>
              )}
            </button>
          )}
          
          <Link to="/orders" className="btn btn-outline-primary">
            View My Orders
          </Link>
        </div>
      </div>
    );
  };
  
  // Update functions for print and download
  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceElement = document.getElementById('invoice-container');
    if (!invoiceElement) {
      console.error('Invoice element not found');
      return;
    }

    // Store original content to restore if there's an error
    const originalInnerHTML = invoiceElement.innerHTML;
    
    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'text-center p-4';
    loadingMessage.innerHTML = '<h3>Generating PDF...</h3><div class="spinner-border text-primary" role="status"></div>';
    invoiceElement.innerHTML = '';
    invoiceElement.appendChild(loadingMessage);

    // Timeout to allow the loading message to render
    setTimeout(() => {
      // Restore original content
      invoiceElement.innerHTML = originalInnerHTML;
      
      // Configure html2canvas options
      const options = {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Handle images with CORS
        allowTaint: true,
        backgroundColor: '#ffffff',
      };

      html2canvas(invoiceElement, options)
        .then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // Calculate dimensions to fit the image properly on the PDF
          const imgWidth = 210 - 20; // A4 width (210mm) minus margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add title
          pdf.setFontSize(16);
          pdf.text('Invoice', 105, 15, { align: 'center' });
          
          // Add image centered
          pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
          
          // Save PDF
          const fileName = `Invoice_${order?._id || 'order'}.pdf`;
          pdf.save(fileName);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          // Restore original content in case of error
          invoiceElement.innerHTML = originalInnerHTML;
          alert('Failed to generate PDF. Please try again.');
        });
    }, 100);
  };

  // Render invoice with correct order items from order object
  const renderInvoice = () => {
    // Use order items from the order object if available, otherwise fallback to cart items
    const itemsToShow = order?.orderItems || cartItems;
    const orderSubtotal = order?.itemsPrice || subtotal;
    const orderShipping = order?.shippingPrice || shipping;
    const orderTax = order?.taxPrice || tax;
    const orderTotal = order?.totalPrice || total;
    
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between mb-4 align-items-center">
            <h3 className="card-title mb-0">
              <FaFileInvoice className="me-2 text-primary" />
              Invoice
            </h3>
            <div>
              <button 
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={handlePrintInvoice}
              >
                <FaPrint className="me-1" /> Print
              </button>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleDownloadInvoice}
              >
                <FaDownload className="me-1" /> Download
              </button>
            </div>
          </div>
          
          <div className="invoice-container p-4 rounded" id="invoice-container">
            <div className="row mb-5">
              <div className="col-6">
                <h4 className="mb-3">PeakHive</h4>
                <p className="mb-1">123 E-Commerce St</p>
                <p className="mb-1">San Francisco, CA 94103</p>
                <p className="mb-1">United States</p>
                <p>support@peakhive.com</p>
              </div>
              <div className="col-6 text-end">
                <h5 className="text-uppercase text-muted mb-3">Invoice</h5>
                <p className="mb-1"><strong>Invoice #:</strong> INV-{order?._id?.substring(0, 8)}</p>
                <p className="mb-1"><strong>Order ID:</strong> {order?.orderId || order?._id}</p>
                <p className="mb-1"><strong>Date:</strong> {new Date(order?.createdAt || Date.now()).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className="badge bg-success">Paid</span></p>
              </div>
            </div>
            
            <div className="row mb-5">
              <div className="col-6">
                <h5 className="mb-3">Bill To:</h5>
                <p className="mb-1">{userInfo?.firstName} {userInfo?.lastName}</p>
                <p className="mb-1">{order?.shippingAddress?.street || shippingAddress.street}</p>
                <p className="mb-1">
                  {order?.shippingAddress?.city || shippingAddress.city}, 
                  {order?.shippingAddress?.state || shippingAddress.state} 
                  {order?.shippingAddress?.zip || shippingAddress.zip}
                </p>
                <p className="mb-1">{order?.shippingAddress?.country || shippingAddress.country}</p>
                <p>{userInfo?.email}</p>
              </div>
              <div className="col-6 text-end">
                <h5 className="mb-3">Payment Method:</h5>
                <p>{order?.paymentMethod || paymentMethod === 'creditCard' ? 'Credit Card' : 
                   paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}</p>
              </div>
            </div>
            
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsToShow.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            width="40" 
                            height="40" 
                            className="me-2 rounded"
                            style={{ objectFit: 'cover' }}
                          />
                          {item.name}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Subtotal</strong></td>
                    <td className="text-end">{formatCurrency(orderSubtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Shipping</strong></td>
                    <td className="text-end">{formatCurrency(orderShipping)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Tax</strong></td>
                    <td className="text-end">{formatCurrency(orderTax)}</td>
                  </tr>
                  <tr className="table-active">
                    <td colSpan="3" className="text-end"><strong>Total</strong></td>
                    <td className="text-end fw-bold">{formatCurrency(orderTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="border-top pt-4">
              <div className="row">
                <div className="col-12">
                  <h5 className="mb-3">Notes:</h5>
                  <p className="text-muted">Thank you for shopping with PeakHive. If you have any questions about your order, please contact our customer support.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button onClick={handleBackToConfirmation} className="btn btn-outline-secondary">
              <FaArrowLeft className="me-1" /> Back to Confirmation
            </button>
            <Link to="/orders" className="btn btn-primary">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  // Update the order summary to use order details when available and fix the double dollar sign issue
  const renderOrderSummary = () => {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Order Summary</h5>
          
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {discount > 0 && (
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Discount ({discount * 100}%)</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          <div className="d-flex justify-content-between mb-2">
            <span>Standard Shipping</span>
            <span>{cartItems.length === 0 ? '$0.00' : formatCurrency(shipping)}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          
          <hr />
          
          <div className="d-flex justify-content-between mb-0">
            <span className="fw-bold">Total</span>
            <span className="fw-bold fs-5">{formatCurrency(total)}</span>
          </div>
          
          {discount > 0 && (
            <div className="mt-2 text-success">
              <small><i className="bi bi-tag-fill me-1"></i>Coupon "{couponCode}" applied</small>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render steps with better state handling
  const renderSteps = () => (
    <div className="checkout-steps d-flex justify-content-center mb-5">
      <div 
        className={`step ${activeStep >= 1 ? 'active' : ''}`}
        onClick={() => goToStep(1)}
        style={{ cursor: 'pointer' }}
      >
        <div className="step-number">1</div>
        <div className="step-title">Shipping</div>
      </div>
      <div className={`step-connector ${activeStep >= 2 ? 'active' : ''}`}></div>
      <div 
        className={`step ${activeStep >= 2 ? 'active' : ''}`}
        onClick={() => activeStep >= 2 ? goToStep(2) : null}
        style={{ cursor: activeStep >= 2 ? 'pointer' : 'not-allowed' }}
      >
        <div className="step-number">2</div>
        <div className="step-title">Payment</div>
      </div>
      <div className={`step-connector ${activeStep >= 3 ? 'active' : ''}`}></div>
      <div 
        className={`step ${activeStep >= 3 ? 'active' : ''}`}
        onClick={() => activeStep >= 3 ? goToStep(3) : null}
        style={{ cursor: activeStep >= 3 ? 'pointer' : 'not-allowed' }}
      >
        <div className="step-number">3</div>
        <div className="step-title">Confirmation</div>
      </div>
      <div className={`step-connector ${activeStep >= 4 ? 'active' : ''}`}></div>
      <div 
        className={`step ${activeStep >= 4 ? 'active' : ''}`}
        onClick={() => activeStep >= 4 ? goToStep(4) : null}
        style={{ cursor: activeStep >= 4 ? 'pointer' : 'not-allowed' }}
      >
        <div className="step-number">4</div>
        <div className="step-title">Invoice</div>
      </div>
    </div>
  );
  
  // Add better error display
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="alert alert-danger mb-4">
        <h5>Error</h5>
        <p className="mb-0">{typeof error === 'string' ? error : (error.message || 'An unknown error occurred')}</p>
        {activeStep === 2 && (
          <div className="mt-2">
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => dispatch(resetOrderSuccess())}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="py-5">
      <div className="container">
        <h1 className="text-center mb-4">Checkout</h1>
        
        {/* Toast Container for notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Checkout Steps */}
        {renderSteps()}
        
        {/* Error Alert */}
        {renderErrorMessage()}
        
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Step Content */}
            {activeStep === 1 && renderShippingForm()}
            {activeStep === 2 && renderPaymentForm()}
            {activeStep === 3 && renderOrderConfirmation()}
            {activeStep === 4 && renderInvoice()}
          </div>
          
          <div className="col-lg-4">
            {/* Order Summary */}
            {renderOrderSummary()}
          </div>
        </div>
      </div>
      
      {/* Custom CSS */}
      <style>{`
        .checkout-steps {
          position: relative;
          margin-bottom: 2rem;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
          position: relative;
        }
        
        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .step.active .step-number {
          background-color: #0d6efd;
          color: white;
        }
        
        .step-title {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .step-connector {
          height: 2px;
          width: 80px;
          background-color: #e9ecef;
          margin-top: 18px;
        }
        
        .step-connector.active {
          background-color: #0d6efd;
        }
        
        .invoice-container {
          background-color: white;
          border: 1px solid #dee2e6;
        }
        
        .step[style*="not-allowed"] {
          opacity: 0.6;
        }
        
        @media print {
          /* Hide everything except the invoice when printing */
          body * {
            visibility: hidden;
          }
          .invoice-container, .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
          }
          /* Hide buttons in invoice when printing */
          button, .btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout; 