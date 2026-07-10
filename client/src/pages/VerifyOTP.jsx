import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';

export const VerifyOTP = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const otpType = location.state?.otpType || 'verification';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('No email specified for OTP verification.');
      navigate('/login');
      return;
    }

    // Countdown Timer
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace: focus previous input
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length !== 6 || isNaN(pasteData)) return;

    const splitData = pasteData.split('');
    setOtp(splitData);
    inputRefs.current[5].focus();
  };

  const handleResend = async () => {
    try {
      const res = await resendOTP(email, otpType);
      toast.success(res.message);
      setTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(email, otpValue, otpType);
      if (res.success) {
        toast.success(res.message);
        
        if (otpType === 'verification') {
          navigate('/login');
        } else if (otpType === 'password_reset') {
          // Pass the verified OTP to reset password view
          navigate('/reset-password', { state: { email, otp: otpValue } });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-darkBg relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,71,87,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,71,87,0.04),rgba(0,0,0,0))] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6 text-center"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Enter OTP Code</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
            We have sent a 6-digit code to <br />
            <strong className="text-slate-700 dark:text-slate-200">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2.5" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand font-sans"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6 uppercase tracking-wider text-sm"
          >
            <span>{loading ? 'Verifying OTP...' : 'Verify OTP'}</span>
            {!loading && <FiCheckCircle />}
          </button>
        </form>

        <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 font-sans">
          Didn't receive the email?{' '}
          {timer > 0 ? (
            <span className="text-slate-400">Resend in {timer}s</span>
          ) : (
            <button 
              onClick={handleResend} 
              className="text-brand font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Resend OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
