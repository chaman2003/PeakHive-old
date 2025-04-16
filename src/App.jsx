import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import './App.css';

// Components
import Layout from './components/layout/Layout';
import routes from './routes';
import { loadCartFromDatabase } from './slices/cartSlice';
import Chatbot from './components/Chatbot';

function App() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.user);
  
  // Load cart from database when user logs in
  useEffect(() => {
    if (userInfo) {
      dispatch(loadCartFromDatabase());
    }
  }, [userInfo, dispatch]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          {routes.map((route, index) => (
            <Route 
              key={index} 
              path={route.path} 
              element={route.element} 
            />
          ))}
        </Routes>
      </Layout>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Chatbot />
    </Router>
  );
}

export default App;
