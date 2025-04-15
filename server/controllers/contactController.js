import ContactMessage from '../models/ContactMessage.js';

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    if (contactMessage) {
      res.status(201).json({
        message: 'Message sent successfully',
        contactMessage
      });
    } else {
      res.status(400).json({ message: 'Invalid message data' });
    }
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all contact messages with pagination
// @route   GET /api/contact
// @access  Private/Admin
const getContactMessages = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter by status if provided
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    
    // Count total for pagination
    const total = await ContactMessage.countDocuments(statusFilter);
    
    // Fetch messages
    const messages = await ContactMessage.find(statusFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      messages,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get contact message by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (message) {
      // If message is unread, mark it as read
      if (message.status === 'unread') {
        message.status = 'read';
        await message.save();
      }
      
      res.json(message);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactMessage = async (req, res) => {
  try {
    const { status, isResolved } = req.body;
    
    const message = await ContactMessage.findById(req.params.id);
    
    if (message) {
      message.status = status || message.status;
      message.isResolved = isResolved !== undefined ? isResolved : message.isResolved;
      
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (message) {
      await ContactMessage.deleteOne({ _id: req.params.id });
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessage,
  deleteContactMessage
}; 