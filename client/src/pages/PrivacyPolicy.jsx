import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen space-y-6 font-sans">
      <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Effective Date: July 8, 2026</p>
      
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          At PizzaGo Platform, we value the trust you place in us. This Privacy Policy describes how we collect, use, and process your personal credentials when you purchase pizzas or browse our website.
        </p>
        
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 pt-2">1. Information We Collect</h2>
        <p>
          We collect shipping coordinates, email registration addresses, full names, profiles avatars, order lists, and billing verification details supplied during payment checkout integrations.
        </p>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 pt-2">2. Processing Payments</h2>
        <p>
          All transaction details are encrypted and securely verified by our payment gateway processor, Razorpay. We do not store credit cards or checkout credentials directly in our database.
        </p>
        
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 pt-2">3. Cookies & Analytical Refills</h2>
        <p>
          We use browser localstorage caches and security token cookies to sustain sessions and maintain active shopping carts during page reload cycles.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
