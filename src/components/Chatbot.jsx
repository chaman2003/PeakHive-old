import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMicrophone } from 'react-icons/fa';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const GEMINI_API_KEY = 'AIzaSyBkQcoIb4W3XjSGG9a5Uw55t2bZLMSUpDo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Simplified request format for gemini-1.5-flash
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `You are a helpful shopping assistant for PeakHive e-commerce store. Answer politely and concisely. The user asks: ${userMessage}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800
          }
        })
      });

      const data = await response.json();
      
      // Log the full response for debugging
      console.log('Gemini API response:', data);
      
      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error.message || 'API returned an error');
      }
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
        const botResponse = data.candidates[0].content.parts[0].text;
        // Process response to remove markdown formatting (**, ##, etc.)
        const cleanResponse = botResponse
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/##(.*?)(?=\n|$)/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/```(.*?)```/gs, '$1')
          .replace(/`(.*?)`/g, '$1')
          .trim();
        
        setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm sorry, I can't respond to that query. Please try asking something related to our products or services." 
        }]);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Could you please rephrase your question?' 
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
                <h6 className="mb-0">PeakHive Assistant</h6>
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
                  placeholder="Type your message..."
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
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 