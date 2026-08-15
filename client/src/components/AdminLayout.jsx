import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiGrid, 
  FiShoppingBag, 
  FiDatabase, 
  FiUsers, 
  FiShoppingBag as FiPizzaIcon, 
  FiArrowLeft, 
  FiLogOut,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { to: '/admin', name: 'Dashboard', icon: <FiGrid /> },
    { to: '/admin/orders', name: 'Manage Orders', icon: <FiShoppingBag /> },
    { to: '/admin/inventory', name: 'Inventory Stock', icon: <FiDatabase /> },
    { to: '/admin/products', name: 'Manage Pizzas', icon: <FiPizzaIcon /> },
    { to: '/admin/users', name: 'Manage Users', icon: <FiUsers /> }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-darkBg transition-colors duration-300 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        
        <div className="space-y-6">
          {/* Logo & Back button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <Link to="/" className="text-xl font-black text-brand">
              🍕 Admin Control
            </Link>
            <Link 
              to="/" 
              className="p-2 rounded-full hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Return to store front"
            >
              <FiArrowLeft />
            </Link>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold font-sans select-none">
              A
            </div>
            <div className="overflow-hidden">
              <p className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Super Admin'}</p>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Admin Privileges</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
                    isActive 
                      ? 'bg-brand text-white shadow-lg shadow-brand/10' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-brand'
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-150 dark:border-slate-800 space-y-3 mt-6 sm:mt-0">

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-left text-brand hover:bg-brand/5 rounded-xl transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wide">Logout admin</span>
          </button>
        </div>

      </aside>

      {/* Main Admin Content Panel */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto min-h-screen">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
