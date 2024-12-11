import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole"); // No need to parse since it's a string
  const [redirect, setRedirect] = React.useState(false); // State for handling redirect after delay

  // If no token or user role doesn't match allowed roles, show error and set redirect
  useEffect(() => {
    if (!token || !allowedRoles.includes(userRole)) {
      setRedirect(true);
      toast.error("You are not authorized to access this page.");
    }
  }, [token, userRole, allowedRoles]);

  // If redirect is triggered, perform navigation to home page
  if (redirect) {
    return <Navigate to="/" />;
  } else {
    return element;
  }
};

export default ProtectedRoute;
