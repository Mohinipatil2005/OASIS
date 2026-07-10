import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

/**
 * Protect middleware: Verifies bearer token and attaches user/admin info.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_access_key_123!@#');

    let profile = await User.findById(decoded.id).select('-password');
    if (!profile) {
      profile = await Admin.findById(decoded.id).select('-password');
    }

    if (!profile) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

/**
 * Admin role check middleware.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
};
