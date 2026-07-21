import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-orange">
              🍕 Pizza Hut
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Handcrafted gourmet pizzas baked to perfection in wood-fired ovens. Order fresh customizable pizzas delivered straight to your door.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-brand hover:text-white transition-all text-slate-600 dark:text-slate-300">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-brand hover:text-white transition-all text-slate-600 dark:text-slate-300">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-brand hover:text-white transition-all text-slate-600 dark:text-slate-300">
                <FiInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors">Pizza Menu</Link>
              </li>
              <li>
                <Link to="/build-pizza" className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors">Custom Pizza Builder</Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-4">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-slate-500 dark:text-slate-400 hover:text-brand transition-colors">Refund Policy</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>© 2026 Pizza Hut Platform. Handcrafted with love.</p>
          <p className="mt-2 sm:mt-0">Developed by Senior Full Stack Team.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
