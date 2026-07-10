import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NotFound = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 text-center dark:bg-darkBg relative">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6"
      >
        <div className="space-y-3">
          <span className="text-7xl select-none animate-bounce block">🍕</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand">404 Error</h1>
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">Page Eaten!</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            The page you are looking for has been devoured or moved to another drawer. Let's redirect you to the main store.
          </p>
        </div>

        <div className="pt-2">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center bg-brand text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider"
          >
            Go Back Home
          </Link>
        </div>
      </motion.div>

    </div>
  );
};

export default NotFound;
