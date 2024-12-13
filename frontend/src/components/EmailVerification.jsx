import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Import react-hot-toast for toast notification

const EmailVerification = () => {
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyEmail(token);  
    } else {
      setStatusMessage('Token not found');
      toast.error('Token not found');
    }
  }, []);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`https://sih-project-xtmx.onrender.com/api/auth/verify-email?token=${token}`);
      setStatusMessage(response.data.message);
      toast.success(response.data.message);
      navigate(response.data.redirectUrl);
    } catch (error) {
      setStatusMessage(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message); // Show error toast
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl text-center text-purple-800 mb-6 font-bold">Email Verification Status</h2>
        <p className="text-center text-lg text-gray-600">{statusMessage}</p>
      </div>
    </div>
  );
};

export default EmailVerification;
