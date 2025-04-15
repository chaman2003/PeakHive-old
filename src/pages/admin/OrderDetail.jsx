import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Divider, 
  Button, Select, MenuItem, FormControl, 
  InputLabel, TextField, Alert, Chip,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Card, CardContent, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, CircularProgress
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { fetchOrderById, updateOrderStatus } from '../../api/adminApi';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrderById(id);
      setOrder(data);
      setNewStatus(data.status || 'pending');
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      toast.error('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast.info('Status is already set to ' + newStatus);
      return;
    }

    try {
      setProcessingAction(true);
      await updateOrderStatus(id, { 
        status: newStatus,
        statusNote: statusNote.trim() ? statusNote : `Status updated to ${newStatus}`
      });
      toast.success(`Order status updated to ${newStatus}`);
      // Refresh order details
      fetchOrderDetails();
      setStatusNote('');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating status:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle refund processing
  const handleProcessRefund = async () => {
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    try {
      setProcessingAction(true);
      // Simulate refund processing
      // In production, this would call your payment gateway's refund API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update order with refund information
      await updateOrderStatus(id, { 
        refunded: true,
        refundAmount: amount,
        refundReason,
        refundDate: new Date().toISOString(),
        statusNote: `Refund processed: $${amount} - ${refundReason}`
      });
      
      toast.success(`Refund of $${amount} processed successfully`);
      setShowRefundDialog(false);
      setRefundAmount('');
      setRefundReason('');
      
      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to process refund');
      console.error('Error processing refund:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
        <CircularProgress />
        <Typography mt={2}>Loading order details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={3}>
        <Alert severity="warning">Order not found</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'primary';
      case 'canceled': return 'error';
      case 'refunded': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/admin/orders')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Order Details
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchOrderDetails} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            sx={{ ml: 1 }}
            onClick={() => window.print()}
          >
            Print Invoice
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Summary Card */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  Order #{order.orderId || order._id}
                </Typography>
                <Chip 
                  label={order.status?.toUpperCase()} 
                  color={getStatusColor(order.status)}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                  <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Payment Status</Typography>
                  <Chip 
                    size="small"
                    label={order.isPaid ? 'PAID' : 'PENDING'} 
                    color={order.isPaid ? 'success' : 'warning'} 
                    icon={order.isPaid ? <CheckIcon /> : null}
                  />
                  {order.isPaid && order.paidAt && (
                    <Typography variant="caption" display="block" mt={0.5}>
                      Paid on: {formatDate(order.paidAt)}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Delivery Status</Typography>
                  <Chip 
                    size="small"
                    label={order.isDelivered ? 'DELIVERED' : 'PENDING'} 
                    color={order.isDelivered ? 'success' : 'warning'} 
                    icon={order.isDelivered ? <CheckIcon /> : null}
                  />
                  {order.isDelivered && order.deliveredAt && (
                    <Typography variant="caption" display="block" mt={0.5}>
                      Delivered on: {formatDate(order.deliveredAt)}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(order.totalPrice)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1 }} /> Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {order.user ? (
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar alt={`${order.user.firstName} ${order.user.lastName}`}>
                        {order.user.firstName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={`${order.user.firstName} ${order.user.lastName}`}
                      secondary={`Customer ID: ${order.user._id}`}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        <EmailIcon color="action" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Email"
                      secondary={order.user.email || 'Not available'}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        <PhoneIcon color="action" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Phone"
                      secondary={order.user.phone || 'Not provided'}
                    />
                  </ListItem>
                </List>
              ) : (
                <Alert severity="warning">Customer information not available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <ShippingIcon sx={{ mr: 1 }} /> Shipping Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {order.shippingAddress ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {order.shippingAddress.street}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.shippingAddress.country}
                  </Typography>
                  
                  {order.shippingMethod && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Shipping Method
                      </Typography>
                      <Typography variant="body1">
                        {order.shippingMethod}
                      </Typography>
                    </Box>
                  )}
                  
                  {order.trackingNumber && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tracking Number
                      </Typography>
                      <Typography variant="body1">
                        {order.trackingNumber}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="warning">Shipping information not available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <ReceiptIcon sx={{ mr: 1 }} /> Payment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1" gutterBottom>
                {order.paymentMethod || 'Not specified'}
              </Typography>
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body1">{formatCurrency(order.itemsPrice)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body1">{formatCurrency(order.shippingPrice)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tax</Typography>
                  <Typography variant="body1">{formatCurrency(order.taxPrice)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatCurrency(order.totalPrice)}</Typography>
                </Grid>
              </Grid>
              
              {order.refunded && (
                <Box mt={2} p={1} bgcolor="#fff4e5" borderRadius={1}>
                  <Typography variant="subtitle2" color="warning.dark">
                    Refund Information
                  </Typography>
                  <Typography variant="body2">
                    Amount: {formatCurrency(order.refundAmount || 0)}
                  </Typography>
                  <Typography variant="body2">
                    Date: {formatDate(order.refundDate)}
                  </Typography>
                  <Typography variant="body2">
                    Reason: {order.refundReason || 'Not specified'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <InventoryIcon sx={{ mr: 1 }} /> Order Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center' }}>Quantity</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #F0F0F0' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <Box display="flex" alignItems="center">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 16 }}
                            />
                            <Typography variant="body1">{item.name}</Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          {formatCurrency(item.price)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Order Actions */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Order Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-select-label">Update Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      value={newStatus}
                      label="Update Status"
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={processingAction}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="canceled">Canceled</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Status Note (optional)"
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    disabled={processingAction}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleStatusUpdate}
                    disabled={processingAction || newStatus === order.status}
                    startIcon={processingAction ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  >
                    {processingAction ? 'Updating...' : 'Update Status'}
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        startIcon={<ShippingIcon />}
                        disabled={processingAction || !order.isPaid || order.isDelivered}
                        onClick={() => {
                          setNewStatus('shipped');
                          setStatusNote('Order has been shipped to the customer.');
                        }}
                      >
                        Mark as Shipped
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        startIcon={<CheckIcon />}
                        disabled={processingAction || !order.isPaid || order.isDelivered}
                        onClick={() => {
                          setNewStatus('delivered');
                          setStatusNote('Order has been delivered to the customer.');
                        }}
                      >
                        Mark as Delivered
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="warning"
                        fullWidth
                        disabled={processingAction || !order.isPaid || order.refunded}
                        onClick={() => setShowRefundDialog(true)}
                      >
                        Process Refund
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<CloseIcon />}
                        disabled={processingAction || order.status === 'canceled' || order.status === 'delivered'}
                        onClick={() => {
                          setNewStatus('canceled');
                          setStatusNote('Order has been canceled.');
                        }}
                      >
                        Cancel Order
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onClose={() => setShowRefundDialog(false)}>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Processing a refund will update the order status and trigger a notification to the customer.
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Refund Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            InputProps={{
              startAdornment: <Box component="span" mr={1}>$</Box>
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Refund Reason"
            fullWidth
            variant="outlined"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefundDialog(false)} disabled={processingAction}>
            Cancel
          </Button>
          <Button 
            onClick={handleProcessRefund} 
            variant="contained" 
            color="primary"
            disabled={processingAction || !refundAmount || !refundReason}
          >
            {processingAction ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Process Refund'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail; 