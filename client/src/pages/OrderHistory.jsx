import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LiveTracker from '../components/LiveTracker';
import { FiShoppingBag, FiTruck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Track which order card is expanded for tracking
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: { page, limit: 5 } });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const toggleExpandTracking = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  if (loading && page === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen animate-pulse space-y-6">
        <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen space-y-8">
      <h1 className="text-3xl font-extrabold flex items-center space-x-2">
        <FiShoppingBag className="text-brand" />
        <span>My Pizza Orders</span>
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
          <span className="text-6xl select-none">🛵</span>
          <h3 className="text-xl font-bold mt-4">No Orders Placed</h3>
          <p className="text-sm text-slate-400 font-sans mt-1">Place your first order to track it live!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            
            return (
              <div 
                key={order._id}
                className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm space-y-4 transition-all"
              >
                
                {/* Header details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-sans block">Order ID: #{order._id.toString().toUpperCase().slice(-8)}</span>
                    <span className="text-[10px] text-slate-450 font-sans block mt-0.5">Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Paid</span>
                      <span className="font-black text-sm">₹{order.totalAmount}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand/10 text-brand animate-pulse'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="space-y-2 text-xs font-sans text-slate-650 dark:text-slate-350 leading-relaxed">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        <strong>{item.name}</strong> x{item.quantity} ({item.size})
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking Expand Actions */}
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <button 
                    onClick={() => toggleExpandTracking(order._id)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-brand focus:outline-none"
                  >
                    <span className="flex items-center space-x-1.5">
                      <FiTruck />
                      <span>{isExpanded ? 'Hide Live Tracker' : 'Track Order Live'}</span>
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {/* Render Live socket updates when expanded */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 animate-fadeIn">
                      <LiveTracker orderId={order._id} initialStatus={order.status} />
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default OrderHistory;
