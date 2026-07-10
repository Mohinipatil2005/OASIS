import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/orders/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setSalesTrend(res.data.salesTrend);
          setCategoryStats(res.data.categoryStats);
          setRecentOrders(res.data.recentOrders);
        }
      } catch (err) {
        toast.error('Failed to load dashboard analytical stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: <FiDollarSign className="text-emerald-500" />, color: 'bg-emerald-500/10' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <FiShoppingBag className="text-brand" />, color: 'bg-brand/10' },
    { label: 'Registered Customers', value: stats?.totalUsers || 0, icon: <FiUsers className="text-brand-orange" />, color: 'bg-brand-orange/10' },
    { label: 'Catalog Pizzas', value: stats?.totalPizzas || 0, icon: <FiTrendingUp className="text-purple-500" />, color: 'bg-purple-500/10' }
  ];

  const COLORS = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#a4b0be'];

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">Analytics Dashboard</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 font-sans mt-0.5">Real-time metrics audit overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx}
            className="glass p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">{kpi.label}</span>
              <span className="text-2xl font-black text-slate-850 dark:text-slate-100">{kpi.value}</span>
            </div>
            <div className={`p-4.5 rounded-2xl ${kpi.color} text-lg`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Trend Chart */}
        <div className="glass p-6 rounded-[32px] border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
          <span className="text-xs font-black uppercase text-slate-400 block tracking-widest">Revenue Trend (Last 7 Days)</span>
          <div className="h-64 sm:h-72 w-full font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4757" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ff4757" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#ff4757" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product Sales */}
        <div className="glass p-6 rounded-[32px] border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
          <span className="text-xs font-black uppercase text-slate-400 block tracking-widest">Top Selling Pizzas</span>
          {categoryStats.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic">No sales recordings yet</div>
          ) : (
            <div className="h-64 sm:h-72 w-full font-sans text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="_id" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#ff4757" radius={[10, 10, 0, 0]} name="Pizzas Sold">
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Recent Orders List */}
      <div className="glass p-6 rounded-[32px] border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
        <span className="text-xs font-black uppercase text-slate-400 block tracking-widest">Recent Orders</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-400 font-extrabold uppercase">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-brand uppercase">#{ord._id.toString().slice(-6)}</td>
                  <td className="py-3.5 px-4">{ord.user?.name || 'Guest'}</td>
                  <td className="py-3.5 px-4 font-black">₹{ord.totalAmount}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[9px] font-bold">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full uppercase text-[9px] font-bold ${
                      ord.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand/10 text-brand'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
