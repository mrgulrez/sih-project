import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUser, FaCalendarAlt, FaEnvelope, FaLock, FaRegCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { RingLoader } from 'react-spinners';  // Importing RingLoader spinner

const RegFormInd = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [dobError, setDobError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // State for the loading spinner
  const navigate = useNavigate();  // Hook for navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Date of birth validation: Check if DOB is in the future
    const today = new Date();
    const selectedDob = new Date(dob);
    if (selectedDob > today) {
      setDobError('Date of birth cannot be in the future.');
      return;
    } else {
      setDobError(''); // Clear error if valid
    }

    // Password matching validation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    setIsLoading(true); // Start loading spinner

    const formData = { name, dob, email, password };

    try {
      const response = await axios.post('http://localhost:5000/api/individual/register', formData);
      setMessage(response.data.message);
      toast.success(response.data.message);

      // Redirect to the login page (or individual URL) upon successful registration
      navigate('/login/individual');  // Redirect to login page or change '/login' to '/individual' as needed
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl text-center text-violet-700 mb-6 font-semibold">Register as Individual</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaUser className="text-blue-600 mr-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Full Name"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date of Birth Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaCalendarAlt className="text-blue-600 mr-3" />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Display DOB Error Message */}
          {dobError && <p className="text-red-700 text-xs">{dobError}</p>}

          {/* Email Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaEnvelope className="text-blue-600 mr-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaLock className="text-blue-600 mr-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaRegCheckCircle className="text-blue-600 mr-3" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm Password"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            >
              {isLoading ? (
                <div className="flex justify-center">
                  <RingLoader size={30} color="#ffffff" loading={isLoading} />
                </div>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>

        {/* Error or Success Message */}
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}

        {/* Link to Login Page if the user already has an account */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login/individual" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegFormInd;
