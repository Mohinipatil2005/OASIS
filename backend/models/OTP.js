import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  otpType: { type: String, enum: ['verification', 'password_reset'], required: true },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

// TTL index to automatically delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash OTP before saving
OTPSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare OTP method
OTPSchema.methods.compareOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otp);
};

const OTP = mongoose.model('OTP', OTPSchema);
export default OTP;
