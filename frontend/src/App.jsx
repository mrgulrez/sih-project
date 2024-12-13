import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import RegForm1 from "./components/RegForm1.jsx";
import RegForm2 from "./components/RegForm2";
import AdminPanel from "./components/AdminPanel";
import LoginPage from "./components/LoginPage";
import IssuingDash from "./components/IssuingDash";
import VerifyDash from "./components/VerifyDash";
import IndividualDash from "./components/IndividualDash";
import EmailVerification from "./components/EmailVerification";
import RegFormInd from "./components/RegFormInd";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./components/About.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="mb-10">
      <Navbar />
      </div>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about/*" element={<About />} />
        <Route path="/register/authority" element={<RegForm1 />} />
        <Route path="/register/individual" element={<RegFormInd />} />
        <Route path="/complete-reg" element={<RegForm2 />} />
        <Route path="/login/:userType" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              element={<AdminPanel />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/issuing-auth-dashboard"
          element={
            <ProtectedRoute
              element={<IssuingDash />}
              allowedRoles={["issuing-auth", "admin"]}
            />
          }
        />
        <Route
          path="/verifying-auth-dashboard"
          element={
            <ProtectedRoute
              element={<VerifyDash />}
              allowedRoles={["verifying-auth", "admin"]}
            />
          }
        />
        <Route
          path="/individual-dashboard/:id"
          element={
            <ProtectedRoute
              element={<IndividualDash />}
              allowedRoles={["individual", "admin"]}
            />
          }
        />
        <Route path="/verify-email" element={<EmailVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;