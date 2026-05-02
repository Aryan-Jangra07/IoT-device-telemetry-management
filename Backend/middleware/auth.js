const jwt = require('jsonwebtoken');

const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from DB to get the latest role and data
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const roleHierarchy = {
      'super_admin': 3,
      'admin': 2,
      'user': 1
    };

    const userRoleValue = roleHierarchy[req.user.role] || 0;
    const requiredRoleValue = roleHierarchy[role] || 0;

    if (userRoleValue < requiredRoleValue) {
      return res.status(403).json({ message: `Access denied. Requires ${role} privileges` });
    }
    
    next();
  };
};

module.exports = { verifyToken, requireRole };
