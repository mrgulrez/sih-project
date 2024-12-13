import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaLock, FaUser, FaEnvelope, FaRegCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners";

const RegisterForm = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("issuing-auth"); // Default to "Issuing Authority"
  const [isPasswordMatch, setIsPasswordMatch] = useState(true); // Flag to track password match
  const [isFormValid, setIsFormValid] = useState(false); // Flag to track overall form validity
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading

  const navigate = useNavigate();

  // Function to check if the passwords match
  const checkPasswordMatch = () => {
    setIsPasswordMatch(password === confirmPassword);
  };

  // Function to validate the form fields
  const validateForm = () => {
    setIsFormValid(organizationName && officialEmail && password && confirmPassword && isPasswordMatch);
  };

  // Effect hook to validate the form when fields change
  useEffect(() => {
    checkPasswordMatch();
    validateForm();
  }, [organizationName, officialEmail, password, confirmPassword, isPasswordMatch]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordMatch) {
      toast.error("Passwords do not match!");
      return;
    }

    const formData = { organizationName, officialEmail, password, role };
    setIsSubmitting(true); // Start loading

    try {
      const response = await axios.post(
        "https://sih-project-xtmx.onrender.com/api/auth/register",
        formData
      );
      toast.success(response.data.message);
      navigate("/"); // Redirect on success
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Error: something went wrong");
      } else {
        toast.error("Error: Unable to connect to server");
      }
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 via-white-50 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-3xl text-center text-violet-700 font-semibold mb-8">
          Register as Authority
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Name Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaUser className="text-blue-600 mr-3" />
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              placeholder="Organization Name"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Official Email Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaEnvelope className="text-blue-600 mr-3" />
            <input
              type="email"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              required
              placeholder="Official Email Address"
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

          {/* Role Selection */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaUser className="text-blue-600 mr-3" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="issuing-auth">Issuing Authority</option>
              <option value="verifying-auth">Verifying Authority</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className={`w-full py-3 rounded-md text-white font-semibold transition duration-300 ease-in-out ${
                isFormValid
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <RingLoader size={24} color="#ffffff" />
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
