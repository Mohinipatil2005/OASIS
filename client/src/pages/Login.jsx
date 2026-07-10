import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect path after login
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password, data.isAdminLogin);
      if (res.success) {
        toast.success(res.message);
        
        // If user is Admin, send to Admin Dashboard; else to original route
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please verify credentials.';
      const errCode = error.response?.data?.code;

      toast.error(errMsg);
      
      // If account email is unverified, redirect to OTP verify state
      if (errCode === 'ACCOUNT_NOT_VERIFIED') {
        navigate('/verify-otp', { state: { email: data.email, otpType: 'verification' } });
      }
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
        className="max-w-md w-full glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 font-sans">Enter your credentials to access your pizza dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiMail />
              </div>
              <input 
                type="email" 
                placeholder="you@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email' }
                })}
                className="pl-10 w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-brand font-sans text-sm"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-brand font-bold font-sans">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand hover:underline font-bold font-sans">Forgot Password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock />
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="pl-10 w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-brand font-sans text-sm"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-brand font-bold font-sans">{errors.password.message}</span>
            )}
          </div>

          {/* Admin Login Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input 
              type="checkbox" 
              id="isAdminLogin"
              {...register('isAdminLogin')}
              className="w-4 h-4 text-brand bg-slate-100 border-slate-300 rounded focus:ring-brand dark:focus:ring-brand dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600 focus:outline-none"
            />
            <label htmlFor="isAdminLogin" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Login as Administrator
            </label>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm uppercase tracking-wider mt-6"
          >
            <span>{loading ? 'Logging you in...' : 'Login'}</span>
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 font-sans">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand font-bold hover:underline">Register here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
