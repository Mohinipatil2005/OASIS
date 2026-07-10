import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { page, limit: 10, search }
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  return (
    <div className="space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
            <FiUsers className="text-brand" />
            <span>Manage Customers</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-sans mt-0.5">Audit user account permissions</p>
        </div>

        <input 
          type="text" 
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border text-xs w-full sm:max-w-xs focus:outline-none shrink-0"
        />
      </div>

      {/* Users Table */}
      {loading && page === 1 ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <span className="text-4xl select-none">👥</span>
          <h3 className="text-sm font-bold mt-2">No Users Found</h3>
        </div>
      ) : (
        <div className="glass rounded-[32px] border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-400 font-extrabold uppercase">
                  <th className="py-3.5 px-4">Profile</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Date Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold font-sans">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold">{u.name}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        u.isVerified 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {u.isVerified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80">
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

export default AdminUsers;
