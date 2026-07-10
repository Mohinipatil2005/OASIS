import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail()
];

export const otpVerifyValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('otpType').isIn(['verification', 'password_reset']).withMessage('Invalid OTP type')
];

export const resetPasswordValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];
