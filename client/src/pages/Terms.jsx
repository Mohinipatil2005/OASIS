import React from 'react';

export const Terms = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen space-y-6 font-sans">
      <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">Terms of Service</h1>
      <p className="text-xs text-slate-400">Effective Date: July 8, 2026</p>
      
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          Welcome to the PizzaGo Platform. By accessing or using our websites and services, you agree to comply with the terms and conditions described below.
        </p>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 pt-2">1. Placing Orders</h2>
        <p>
          All pizza orders placed on the platform are subject to ingredients availability checks. The system will halt checkout operations if inventory levels run below required quantities.
        </p>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 pt-2">2. Refunds & Cancellation</h2>
        <p>
          Since food items are freshly prepared, cancellation requests are not permitted once the order status transitions to "preparing" or "kitchen".
        </p>
      </div>
    </div>
  );
};

export default Terms;
