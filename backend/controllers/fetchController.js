import jwt from 'jsonwebtoken';
import AuthReg from '../models/AuthReg.js';
import Admin from '../models/Admin.js';
import IndReg from '../models/IndReg.js';

// Controller to fetch the user's role based on JWT
export const getUserRole = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // List of model collections to check
    const models = [AuthReg, Admin, IndReg];
    let user = null;

    // Iterate through the models and try to find the user
    for (let model of models) {
      user = await model.findById(userId);
      if (user) break;  // Stop searching once we find the user
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user's role as response
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Failed to authenticate user', error: error.message });
  }
};