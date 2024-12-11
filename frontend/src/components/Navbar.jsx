import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  FiHome, 
  FiInfo, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX 
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Decode JWT token
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error("Token decoding error:", error);
      return null;
    }
  };

  // Check login status and token validity
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decodeJwt(token);
      if (decodedToken) {
        const expiryTime = decodedToken.exp;
        const currentTime = Date.now() / 1000;

        if (expiryTime > currentTime) {
          setIsLoggedIn(true);
          setUserRole(localStorage.getItem("userRole") || "");
        } else {
          handleLogout();
        }
      }
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userUniqueID");
    setIsLoggedIn(false);
    setUserRole("");
    toast.success("Logged out successfully!");
    
    setTimeout(() => {
      navigate("/");
      //window.location.reload();
    }, 1200);
  };

  // Navigation menu items
  const menuItems = [
    { 
      name: "Home", 
      path: "/", 
      icon: <FiHome className="mr-2" /> 
    },
    { 
      name: "About", 
      path: "/about", 
      icon: <FiInfo className="mr-2" /> 
    }
  ];

  // Conditional dashboard link based on user role
  const getDashboardLink = () => {
    if (!isLoggedIn) return null;
    
    switch(userRole) {
      case "individual": {
        const uniqueID = localStorage.getItem("userUniqueID");
        return `/individual-dashboard/${uniqueID}`;
      }
      case "admin":
        return "/admin-dashboard";
      case "issuing-auth":
        return "/issuing-auth-dashboard";
      case "verifying-auth":
        return "/verifying-auth-dashboard";
      default:
        return null;
    }
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-md"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/verification.ico" 
            alt="DocLedger Logo" 
            className="h-8 w-8 mr-3"
          />
          <span className="text-2xl font-bold text-gray-800">DocLedger</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center text-gray-700 hover:text-blue-600 transition-colors ${
                location.pathname === item.path ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          {/* Conditional Dashboard/Login Link */}
          {isLoggedIn ? (
            <>
              {getDashboardLink() && (
                <Link
                  to={getDashboardLink()}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FiUser className="mr-2" />
                  Dashboard
                </Link>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <FiLogOut className="mr-2" />
                Logout
              </motion.button>
            </>
          ) : (
            <Link
              to="/contact"
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Contact
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-800 focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-md"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center w-full p-2 rounded ${
                    location.pathname === item.path 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {/* Mobile Conditional Login/Logout */}
              {isLoggedIn ? (
                <>
                  {getDashboardLink() && (
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full p-2 rounded hover:bg-gray-100"
                    >
                      <FiUser className="mr-2" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 rounded text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-blue-500 text-white text-center px-4 py-2 rounded-full"
                >
                  Contact
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;