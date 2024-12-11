import jwt from "jsonwebtoken";

// Middleware to check if the user is authenticated and has the correct role
const verifyRole = (roles) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from header
    if (!token) {
      return res.status(401).json({ message: "No token provided, access denied." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      req.user = decoded; // Attach decoded user info to request object

      // Check if the user's role is allowed to access this route
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to access this route." });
      }
      next(); // User is authenticated and authorized, proceed to next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

export { verifyRole };