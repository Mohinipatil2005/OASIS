import express from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  otpVerifyValidator,
  resetPasswordValidator
} from '../validators/authValidator.js';
import { validateRequest } from '../middlewares/validator.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/verify-otp', otpVerifyValidator, validateRequest, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginValidator, validateRequest, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);
router.post('/logout', logout);

export default router;
