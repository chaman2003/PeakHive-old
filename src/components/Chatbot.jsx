import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMicrophone } from 'react-icons/fa';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Fallback responses for when API is unavailable
const FALLBACK_RESPONSES = [
  "I'm sorry, but I can't access the AI service right now. Please try asking about our products directly in the search bar or contact customer support.",
  "Our AI assistant is currently unavailable. You can browse our products or contact us directly for help.",
  "I apologize, but I'm unable to answer your question right now. Please try using our navigation menu to find what you're looking for.",
  "I'm having trouble connecting to our AI service. Please check our FAQ section or contact us directly for help with your question.",
  "Sorry, our AI assistant is temporarily unavailable. You can search for products using the search bar or browse our categories."
];

// Get a random fallback response
const getRandomFallbackResponse = () => {
  const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[index];
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your PeakHive shopping assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if API is available on component mount
  useEffect(() => {
    checkApiAvailability();
  }, []);

  // Function to check if API is available
  const checkApiAvailability = async () => {
    try {
      console.log("Checking AI API availability...");
      // Use the dedicated status endpoint
      const response = await axios.get('/api/ai/status');
      console.log("AI API check response:", response.data);
      setApiAvailable(response.data.available);
      
      if (!response.data.available) {
        setMessages(prev => [
          prev[0],
          { 
            role: 'assistant', 
            content: "I notice that our AI assistant isn't available right now. I'll do my best to help with basic information, but my responses will be limited." 
          }
        ]);
      }
    } catch (error) {
      console.error("Error checking API availability:", error);
      setApiAvailable(false);
      setMessages(prev => [
        prev[0],
        { 
          role: 'assistant', 
          content: "I notice that our AI assistant isn't available right now. I'll do my best to help with basic information, but my responses will be limited." 
        }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Log the user's message
    console.log("User message:", userMessage);

    // If API is not available, respond with fallback
    if (!apiAvailable) {
      console.log("Using fallback response (API not available in region)");
      setTimeout(() => {
        const fallbackResponse = getRandomFallbackResponse();
        setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
        setIsLoading(false);
      }, 1000); // Small delay to simulate thinking
      return;
    }

    try {
      console.log("Sending request to backend AI endpoint...");
      const response = await axios.post('/api/ai/chat', { message: userMessage });
      
      console.log('AI API response:', response.data);
      
      if (response.data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      } else if (response.data.message) {
        // Handle error message returned from the API
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.message
        }]);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      
      // Display appropriate error message
      let errorMessage = 'I apologize, but I encountered an error. Could you please rephrase your question?';
      
      if (error.response?.status === 403) {
        if (error.response.data.locationRestricted) {
          setApiAvailable(false);
          errorMessage = "I'm sorry, but our AI assistant isn't available in your region. Please contact customer support or browse our products directly.";
        } else {
          errorMessage = error.response.data.message || "Your question contains prohibited content. Please try asking something else.";
        }
      }
      
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary position-fixed"
        style={{
          bottom: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
          border: 'none'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRobot size={24} />
      </motion.button>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="position-fixed"
            style={{
              bottom: '20px',
              right: '20px',
              width: '350px',
              height: '500px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              className="d-flex justify-content-between align-items-center p-3"
              style={{
                borderBottom: '1px solid #eee',
                background: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
                color: 'white'
              }}
            >
              <div className="d-flex align-items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <FaRobot className="me-2" />
                </motion.div>
                <h6 className="mb-0">PeakHive Assistant {!apiAvailable && "(Limited)"}</h6>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="btn btn-link p-0"
                style={{ color: 'white' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes />
              </motion.button>
            </div>

            {/* Messages */}
            <div
              className="flex-grow-1 p-3 overflow-auto"
              style={{ 
                backgroundColor: '#f8f9fa',
                backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
              }}
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-3 d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-3 rounded ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white text-dark'
                    }`}
                    style={{
                      maxWidth: '80%',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: message.role === 'assistant' ? '1px solid #eee' : 'none'
                    }}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="d-flex justify-content-start mb-3"
                >
                  <div className="p-3 rounded bg-white text-dark"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #eee'
                    }}
                  >
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Thinking...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-top"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder={apiAvailable ? "Type your message..." : "AI assistant unavailable..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  style={{
                    borderRadius: '20px',
                    border: '1px solid #eee',
                    padding: '10px 15px'
                  }}
                />
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !input.trim()}
                  style={{
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
                    border: 'none',
                    padding: '10px 20px'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
              {!apiAvailable && (
                <div className="mt-2 text-center">
                  <small className="text-muted">
                    AI service is currently unavailable. Limited responses only.
                  </small>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 