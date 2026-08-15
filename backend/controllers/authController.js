import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import {
  sendRegistrationEmail,
  sendOTPEmail,
  sendForgotPasswordEmail
} from '../services/emailService.js';

// Console logging helper for development OTPs
const logOTP = (email, otp, type) => {
  console.log('\n==================================================');
  console.log(`[DEVELOPMENT OTP] ${type.toUpperCase()}`);
  console.log(`Email: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log('==================================================\n');
};

// Token generation helpers
const generateAccessToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_access_key_123!@#',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

const generateRefreshToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456!@#',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Register User
 */
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });

    // Generate 6-digit verification OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await OTP.create({
      email,
      otp: otpCode,
      otpType: 'verification',
      expiresAt
    });

    // Send Welcome and OTP Emails (in the background)
    logOTP(email, otpCode, 'verification');
    sendRegistrationEmail(email, name).catch(err => console.error('Registration email failed:', err.message));
    sendOTPEmail(email, otpCode).catch(err => console.error('OTP email failed:', err.message));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (req, res, next) => {
  const { email, otp, otpType } = req.body;

  try {
    // Development Bypass: allow 123456 to verify any account instantly
    if (otp === '123456' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
      if (otpType === 'verification') {
        const user = await User.findOne({ email });
        if (user) {
          user.isVerified = true;
          await user.save();
        }
      }
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully (Development Bypass).'
      });
    }

    const otpRecord = await OTP.findOne({ email, otpType });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // OTP verified
    if (otpType === 'verification') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.isVerified = true;
      await user.save();
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: otpType === 'verification' ? 'Email verified successfully.' : 'OTP verified. You can now reset your password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP Code
 */
export const resendOTP = async (req, res, next) => {
  const { email, otpType } = req.body;

  if (!email || !otpType) {
    return res.status(400).json({ success: false, message: 'Email and otpType are required' });
  }

  try {
    // Clear any existing OTP for this type and email
    await OTP.deleteMany({ email, otpType });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email,
      otp: otpCode,
      otpType,
      expiresAt
    });

    logOTP(email, otpCode, otpType);
    if (otpType === 'verification') {
      sendOTPEmail(email, otpCode).catch(err => console.error('Resend OTP email failed:', err.message));
    } else if (otpType === 'password_reset') {
      sendForgotPasswordEmail(email, otpCode).catch(err => console.error('Resend forgot password email failed:', err.message));
    }

    res.status(200).json({
      success: true,
      message: `A new OTP has been dispatched to ${email}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User / Admin
 */
export const login = async (req, res, next) => {
  const { email, password, isAdminLogin } = req.body;

  try {
    let account = null;
    let isUser = true;

    if (isAdminLogin) {
      account = await Admin.findOne({ email });
      isUser = false;
    } else {
      account = await User.findOne({ email });
    }

    if (!account) {
      // In case they didn't specify isAdminLogin but are trying to log in as admin, check both
      account = await User.findOne({ email });
      if (!account) {
        account = await Admin.findOne({ email });
        isUser = false;
      }
    }

    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify Password
    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Ensure user email is verified
    if (isUser && !account.isVerified) {
      // Trigger new OTP
      await OTP.deleteMany({ email: account.email, otpType: 'verification' });
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.create({
        email: account.email,
        otp: otpCode,
        otpType: 'verification',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
      logOTP(account.email, otpCode, 'verification');
      sendOTPEmail(account.email, otpCode).catch(err => console.error('Login verify OTP email failed:', err.message));

      return res.status(403).json({
        success: false,
        message: 'Account not verified. Verification OTP sent to your email.',
        code: 'ACCOUNT_NOT_VERIFIED'
      });
    }

    const role = isUser ? account.role : 'admin';
    const accessToken = generateAccessToken(account._id, role);
    const refreshToken = generateRefreshToken(account._id, role);

    account.refreshToken = refreshToken;
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        role: role,
        profileImage: account.profileImage || '',
        wishlist: account.wishlist || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token
 */
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456!@#');

    let account = await User.findOne({ _id: decoded.id, refreshToken });
    if (!account) {
      account = await Admin.findOne({ _id: decoded.id, refreshToken });
    }

    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const role = account.role;
    const newAccessToken = generateAccessToken(account._id, role);
    const newRefreshToken = generateRefreshToken(account._id, role);

    account.refreshToken = newRefreshToken;
    await account.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh Token Error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

/**
 * Forgot Password
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    let account = await User.findOne({ email });
    if (!account) {
      account = await Admin.findOne({ email });
    }

    if (!account) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    // Clear existing resets
    await OTP.deleteMany({ email, otpType: 'password_reset' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email,
      otp: otpCode,
      otpType: 'password_reset',
      expiresAt
    });

    logOTP(email, otpCode, 'password_reset');
    sendForgotPasswordEmail(email, otpCode).catch(err => console.error('Forgot password email failed:', err.message));

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    let isValid = false;
    if (otp === '123456' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
      isValid = true;
    } else {
      const otpRecord = await OTP.findOne({ email, otpType: 'password_reset' });
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'OTP expired or not found' });
      }

      const isMatch = await otpRecord.compareOTP(otp);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
      }
      isValid = true;
      // Delete OTP
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    if (isValid) {
      let account = await User.findOne({ email });
      if (!account) {
        account = await Admin.findOne({ email });
      }

      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      account.password = newPassword;
      account.refreshToken = ''; // Revoke current login sessions
      await account.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    let account = await User.findOne({ refreshToken });
    if (!account) {
      account = await Admin.findOne({ refreshToken });
    }

    if (account) {
      account.refreshToken = '';
      await account.save();
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
