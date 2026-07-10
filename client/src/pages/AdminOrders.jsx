import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiEdit, FiMapPin, FiPrinter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin/list', {
        params: { page, limit: 10, status: statusFilter }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load orders list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh local orders list
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handlePrintInvoice = (orderId) => {
    // Open standard success invoice page in a print frame
    window.open(`/payment-success/${orderId}`, '_blank');
  };

  const statusColors = {
    received: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    preparing: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    kitchen: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    delivery: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
            <FiShoppingBag className="text-brand" />
            <span>Manage Orders</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-sans mt-0.5">Fulfill customer pizza deliveries</p>
        </div>

        {/* Status Filters */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none font-sans text-xs shrink-0 max-w-xs"
        >
          <option value="">All Orders Status</option>
          <option value="received">Received</option>
          <option value="preparing">Preparing</option>
          <option value="kitchen">In Kitchen</option>
          <option value="delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
          <span className="text-5xl select-none">📦</span>
          <h3 className="text-lg font-bold mt-3">No Orders Found</h3>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div 
              key={order._id}
              className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              
              {/* Order Info & Items */}
              <div className="space-y-3 flex-grow max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm text-brand uppercase">#{order._id.toString().toUpperCase().slice(-8)}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{new Date(order.createdAt).toLocaleString()}</span>
                  <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items Purchased List */}
                <div className="space-y-1 font-sans text-xs text-slate-600 dark:text-slate-400">
                  {order.items.map((item, idx) => (
                    <p key={idx}>
                      • <strong>{item.name}</strong> x{item.quantity} ({item.size}) 
                      {item.isCustomized && <span className="text-[10px] text-brand ml-1.5 font-bold">(Custom Build)</span>}
                    </p>
                  ))}
                </div>

                {/* Address block */}
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-sans">
                  <FiMapPin />
                  <span className="truncate">
                    {order.shippingAddress?.street || 'N/A'}, {order.shippingAddress?.city || 'N/A'} | Phone: {order.shippingAddress?.phone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Status Update Dropdown & Invoice print */}
              <div className="flex flex-wrap items-center gap-4 shrink-0 sm:justify-end">
                
                {/* Total Paid */}
                <div className="text-left md:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Paid Amount</span>
                  <span className="text-lg font-black">₹{order.totalAmount}</span>
                </div>

                {/* Status Trigger Dropdown */}
                <div className="flex items-center space-x-1.5">
                  <FiEdit className="text-slate-400" />
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none font-sans text-xs"
                  >
                    <option value="received">Received</option>
                    <option value="preparing">Preparing</option>
                    <option value="kitchen">In Kitchen</option>
                    <option value="delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Print Invoice */}
                <button
                  onClick={() => handlePrintInvoice(order._id)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 hover:border-brand hover:text-brand"
                  title="Print invoice receipt"
                >
                  <FiPrinter className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>
              <span className="text-xs font-bold font-sans px-4">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminOrders;
