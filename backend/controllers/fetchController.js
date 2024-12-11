import jwt from 'jsonwebtoken';
import AuthReg from '../models/AuthReg.js'; 
import Admin from '../models/Admin.js';

// Controller to fetch the user's role based on JWT
export const getUserRole = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user by decoded user ID
    let user = await AuthReg.findById(decoded.id);

    if (!user) {
      user = await Admin.findById(decoded.id);
      if(!user)
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user's role as response
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Failed to authenticate user', error: error.message });
  }
};
