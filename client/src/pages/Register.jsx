import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data.name, data.email, data.password);
      if (res.success) {
        toast.success(res.message);
        // Redirect to OTP verification page
        navigate('/verify-otp', { state: { email: data.email, otpType: 'verification' } });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errMsg);
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
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400 font-sans">Get started by filling out the details below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiUser />
              </div>
              <input 
                type="text" 
                placeholder="John Doe"
                {...register('name', { required: 'Name is required' })}
                className="pl-10 w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-brand font-sans text-sm"
              />
            </div>
            {errors.name && (
              <span className="text-[10px] text-brand font-bold font-sans">{errors.name.message}</span>
            )}
          </div>

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
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock />
              </div>
              <input 
                type="password" 
                placeholder="Minimum 6 characters"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                })}
                className="pl-10 w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-brand font-sans text-sm"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-brand font-bold font-sans">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm uppercase tracking-wider mt-6"
          >
            <span>{loading ? 'Creating your account...' : 'Register'}</span>
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-bold hover:underline">Login here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
