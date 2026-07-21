import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiPrinter, FiArrowRight, FiMapPin, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const PaymentSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        toast.error('Failed to load order receipt details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 min-h-[70vh]">
        <h3 className="text-xl font-bold">Receipt Not Found</h3>
        <Link to="/" className="text-brand font-bold hover:underline">Back Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen space-y-8 print:py-0 print:px-0">
      
      {/* Visual Success Confirmation Banner */}
      <div className="text-center space-y-3 print:hidden">
        <div className="inline-block text-6xl text-emerald-500 animate-bounce">
          <FiCheckCircle className="mx-auto" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">Order Confirmed!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
          Your payment was successfully processed. We have sent the confirmation invoice to your email address.
        </p>
      </div>

      {/* Invoice Details Card */}
      <div className="glass p-6 sm:p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-800/80 shadow-xl space-y-6 print:border-none print:shadow-none print:glass-none print:bg-white print:text-black">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <span className="text-xl font-black text-slate-850 dark:text-slate-100">🍕 PizzaGo Invoice</span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">Order ID: #{order._id.toString().toUpperCase()}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 px-3.5 py-1 rounded-full uppercase tracking-wider">PAID</span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 print:bg-slate-100 print:text-black">
          <div className="space-y-1.5 text-xs font-sans">
            <span className="font-bold text-slate-450 block uppercase tracking-wider">Deliver To:</span>
            <p className="font-extrabold text-slate-700 dark:text-slate-200 print:text-black">{order.user?.name}</p>
            <div className="flex items-center space-x-1 text-slate-500">
              <FiMapPin />
              <span>{order.shippingAddress?.street || 'N/A'}, {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'} - {order.shippingAddress?.zipCode || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs font-sans sm:text-right">
            <span className="font-bold text-slate-450 block uppercase tracking-wider">Contact Phone:</span>
            <div className="flex items-center sm:justify-end space-x-1 text-slate-500">
              <FiPhone />
              <span>{order.shippingAddress?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Invoice Items list */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Items Purchased</span>
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-sans border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-250 print:text-black">{item.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2">Qty: {item.quantity} | Size: {item.size}</span>
                  {item.isCustomized && (
                    <span className="text-[9px] text-brand block mt-0.5 font-bold">Custom Build recipe</span>
                  )}
                </div>
                <span className="font-extrabold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Calculations */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 font-sans">
          <span className="text-sm font-bold">Grand Total Paid</span>
          <span className="text-2xl font-black text-brand">₹{order.totalAmount}</span>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 px-8 py-3.5 rounded-2xl font-bold transition-all"
        >
          <FiPrinter />
          <span>Print Invoice</span>
        </button>
        <Link 
          to="/dashboard" // Redirect to order tracking dashboard
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brand text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
        >
          <span>Track Order Status</span>
          <FiArrowRight />
        </Link>
      </div>

    </div>
  );
};

export default PaymentSuccess;
