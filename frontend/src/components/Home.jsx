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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

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

      <motion.section
        className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0"
          whileHover={{ scale: 1.05 }}
        >
          <img
            className="object-cover object-center rounded"
            alt="hero"
            src="https://www.financialexpress.com/business/blockchain-synergising-forces-uniting-blockchain-and-ai-for-secure-tech-advancements-3208095"
          />
        </motion.div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <motion.h1
            className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900"
            whileHover={{ scale: 1.1 }}
          >
            Smart, Secure, Decentralized
            <br className="hidden lg:inline-block" />Document Verification
          </motion.h1>
          <p className="mb-8 leading-relaxed">
            Say goodbye to manual processes and hello to automated, tamper-proof document verification. <strong>DocLedger</strong> leverages AI and Blockchain to ensure integrity, security, and efficiency in every verification step.
          </p>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <motion.h1
            className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900"
            whileHover={{ scale: 1.1 }}
          >
            Built for Simplicity
            <br className="hidden lg:inline-block" />Designed for Security
          </motion.h1>
          <p className="mb-8 leading-relaxed">
            From issuing authorities to end-users, <strong>DocLedger</strong> offers intuitive role-based dashboards that streamline workflows and guarantee data authenticity. Automate processes, protect sensitive data, and scale effortlessly.
          </p>
        </div>
        <motion.div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6"
          whileHover={{ scale: 1.05 }}
        >
          <img
            className="object-cover object-center rounded"
            alt="features"
            src="https://dummyimage.com/720x600"
          />
        </motion.div>
      </motion.section>

      {/* Roles Section */}
      <motion.section
        className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0"
          whileHover={{ scale: 1.05 }}
        >
          <img
            className="object-cover object-center rounded"
            alt="roles"
            src="https://dummyimage.com/720x600"
          />
        </motion.div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <motion.h1
            className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900"
            whileHover={{ scale: 1.1 }}
          >
            Seamless Experiences for Everyone
          </motion.h1>
          <p className="mb-8 leading-relaxed">
            <strong>Issuing Authorities:</strong> Securely upload and hash documents on the blockchain.<br />
            <strong>Verifying Authorities:</strong> Validate user-submitted documents in real-time with AI.<br />
            <strong>Individuals:</strong> Access, view, and share your verified documents with ease.
          </p>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <motion.h1
            className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900"
            whileHover={{ scale: 1.1 }}
          >
            Why Choose DocLedger?
          </motion.h1>
          <p className="mb-8 leading-relaxed">
            <strong>Enhanced Security:</strong> Blockchain and AI ensure zero compromises on data integrity.<br />
            <strong>Time Savings:</strong> Automated workflows minimize manual errors and delays.<br />
            <strong>Scalability:</strong> Adapt to growing needs with batch uploads and decentralized storage.<br />
            <strong>User-Friendly Design:</strong> A clean interface for smooth navigation across roles.
          </p>
        </div>
        <motion.div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6"
          whileHover={{ scale: 1.05 }}
        >
          <img
            className="object-cover object-center rounded"
            alt="benefits"
            src="https://dummyimage.com/720x600"
          />
        </motion.div>
      </motion.section>

      {/* Technology Section */}
      <motion.section
        className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0"
          whileHover={{ scale: 1.05 }}
        >
          <img
            className="object-cover object-center rounded"
            alt="tech stack"
            src="https://dummyimage.com/720x600"
          />
        </motion.div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <motion.h1
            className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900"
            whileHover={{ scale: 1.1 }}
          >
            Powered by Leading Technologies
          </motion.h1>
          <p className="mb-8 leading-relaxed">
            <strong>Frontend:</strong> React.js for dynamic and responsive user interfaces.<br />
            <strong>Backend:</strong> Node.js for high-performance server-side logic.<br />
            <strong>AI:</strong> TensorFlow and Google Vision API for advanced fraud detection.<br />
            <strong>Blockchain:</strong> Ethereum for immutable document storage.<br />
            <strong>Storage:</strong> IPFS for decentralized, secure file management.
          </p>
        </div>
      </motion.section>
          
    </div>
  );
};

export default Home;