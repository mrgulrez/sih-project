import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronDown, 
  FiLock, 
  FiShield, 
  FiDatabase, 
  FiCheckCircle,
  FiMenu,
  FiX
} from "react-icons/fi";
import { TypeAnimation } from "react-type-animation";
import bgImage from "../assets/bg2.png";
import axios from "axios";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center mb-4">
      <Icon className="text-3xl text-blue-500 mr-4" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("individual");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const registerRef = useRef(null);
  const loginRef = useRef(null);

  // Authentication logic (same as previous implementation)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decodeJwt(token);
      const expiryTime = decodedToken.exp;
      const currentTime = Date.now() / 1000;

      if (expiryTime > currentTime) {
        setIsLoggedIn(true);
        fetchUserRole();
      } else {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const decodeJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    return decoded;
  };

  const fetchUserRole = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user role", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (registerRef.current && !registerRef.current.contains(event.target)) {
        setRegisterOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setLoginOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegisterClick = (type) => {
    navigate(`/register/${type}`);
    setRegisterOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = (type) => {
    navigate(`/login/${type}`);
    setLoginOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleDashboardRedirect = () => {
    if (userRole === "individual") {
      const uniqueID = localStorage.getItem("userUniqueID");
      navigate(`/${userRole}-dashboard/${uniqueID}`);
    } else {
      navigate(`/${userRole}-dashboard`);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-100 flex flex-col">
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm shadow-sm z-50 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">DocLedger</h1>
        <button 
          onClick={toggleMobileMenu} 
          className="text-2xl text-gray-800 focus:outline-none"
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-40 pt-20 p-6 flex flex-col"
          >
            {!isLoggedIn ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold mb-4">Register</h2>
                  {["authority", "individual"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleRegisterClick(type)}
                      className="block w-full text-left px-4 py-3 bg-blue-50 rounded-lg text-gray-800 capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold mb-4">Login</h2>
                  {["admin", "issuing-auth", "verifying-auth", "individual"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleLoginClick(type)}
                      className="block w-full text-left px-4 py-3 bg-purple-50 rounded-lg text-gray-800 capitalize"
                    >
                      {type.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <button
                onClick={handleDashboardRedirect}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation Section */}
      <nav className="hidden md:block absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        {/* Removed the 'Go to Dashboard' button from the top navigation */}
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 flex flex-col md:flex-row flex-grow items-center justify-between pt-20 md:pt-0">
        {/* Left Content */}
        <div className="w-full md:w-1/2 text-center md:text-left md:pr-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900"
          >
            Welcome to DocLedger
          </motion.h1>
          
          {/* Typewriter Effect */}
          <div className="text-xl md:text-2xl text-gray-700 mb-8 h-20">
            <TypeAnimation
              sequence={[
                "Secure Document Management",
                2000,
                "Blockchain-Powered Verification",
                2000,
                "Trusted Digital Repository",
                2000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="font-semibold"
            />
          </div>

          {/* Go to Dashboard button added here for logged-in users */}
          {isLoggedIn && (
            <motion.button
              onClick={handleDashboardRedirect}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors mb-8"
            >
              Go to Dashboard
            </motion.button>
          )}

          {/* Authentication Buttons - Desktop */}
          {!isLoggedIn && (
            <div className="hidden md:flex space-x-4">
              {/* Register Dropdown */}
              <div className="relative" ref={registerRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRegisterOpen(!isRegisterOpen)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center transition-colors"
                >
                  Register
                  <FiChevronDown className="ml-2" />
                </motion.button>

                <AnimatePresence>
                  {isRegisterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-white rounded-lg shadow-xl z-10"
                    >
                      <div className="py-1">
                        {["authority", "individual"].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleRegisterClick(type)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 capitalize"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Login Dropdown */}
              <div className="relative" ref={loginRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLoginOpen(!isLoginOpen)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center transition-colors"
                >
                  Login
                  <FiChevronDown className="ml-2" />
                </motion.button>

                <AnimatePresence>
                  {isLoginOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-white rounded-lg shadow-xl z-10"
                    >
                      <div className="py-1">
                        {["admin", "issuing-auth", "verifying-auth", "individual"].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleLoginClick(type)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 capitalize"
                          >
                            {type.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Image */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex w-1/2 justify-center items-center"
        >
          <img
            src={bgImage}
            alt="DocLedger Platform"
            className="max-h-[500px] object-contain"
          />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FeatureCard 
            icon={FiLock}
            title="Secure Storage"
            description="Military-grade encryption to protect your sensitive documents."
          />
          <FeatureCard 
            icon={FiShield}
            title="Blockchain Verification"
            description="Immutable record-keeping with blockchain technology."
          />
          <FeatureCard 
            icon={FiDatabase}
            title="Comprehensive Management"
            description="Effortlessly upload, organize, and retrieve your documents."
          />
          <FeatureCard 
            icon={FiCheckCircle}
            title="Instant Validation"
            description="Quick and reliable document authentication process."
          />
        </div>
      </div>
    </div>
  );
};

export default Home;