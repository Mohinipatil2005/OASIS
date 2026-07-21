import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingBag, 
  FiHeart, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiSun, 
  FiMoon, 
  FiBell, 
  FiSettings, 
  FiGrid 
} from 'react-icons/fi';
import api from '../services/api';

export const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { liveNotifications } = useSocket();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch initial notifications
  useEffect(() => {
    if (isAuthenticated) {
      const getNotificationsList = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.data.success) {
            setNotifications(res.data.notifications);
            setUnreadNotifications(res.data.notifications.filter(n => !n.isRead).length);
          }
        } catch (err) {
          console.warn('Failed to load user notifications', err.message);
        }
      };
      getNotificationsList();
    }
  }, [isAuthenticated, liveNotifications]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.warn('Error reading notifications', err.message);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 glass border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-orange select-none">
                🍕 Pizza-Hut
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8">
            <NavLink to="/" className={({ isActive }) => 
              `text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand ${isActive ? 'text-brand' : 'text-slate-600 dark:text-slate-300'}`
            }>HOME</NavLink>
            
            <NavLink to="/menu" className={({ isActive }) => 
              `text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand ${isActive ? 'text-brand' : 'text-slate-600 dark:text-slate-300'}`
            }>MENU</NavLink>
            
            <NavLink to="/build-pizza" className={({ isActive }) => 
              `text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand ${isActive ? 'text-brand' : 'text-slate-600 dark:text-slate-300'}`
            }>BUILD PIZZA</NavLink>
            
            {isAuthenticated && (
              <NavLink to="/orders" className={({ isActive }) => 
                `text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand ${isActive ? 'text-brand' : 'text-slate-600 dark:text-slate-300'}`
              }>MY ORDERS</NavLink>
            )}
          </div>

          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-slate-600 dark:text-slate-300 focus:outline-none"
              aria-label="Toggle Theme"
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>



            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button 
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileDropdownOpen(false); }}
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-brand text-[10px] text-white font-extrabold flex items-center justify-center rounded-full border-2 border-white dark:border-darkBg-card animate-bounce">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-3 w-80 rounded-2xl glass shadow-2xl p-4 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                        {unreadNotifications > 0 && (
                          <button onClick={markAllRead} className="text-xs font-bold text-brand hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-center text-slate-400 py-6">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`p-2.5 rounded-xl text-xs transition-colors ${n.isRead ? 'opacity-70 bg-transparent' : 'bg-brand/5 dark:bg-brand/10 border-l-2 border-brand'}`}>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Shopping Cart */}
            <Link 
              to="/cart" 
              className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-slate-600 dark:text-slate-300"
            >
              <FiShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-brand text-[10px] text-white font-extrabold flex items-center justify-center rounded-full border-2 border-white dark:border-darkBg-card"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotificationsOpen(false); }}
                  className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="avatar" 
                      className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                    />
                  ) : (
                    <div className="w-8.5 h-8.5 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl glass shadow-2xl p-2 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                        <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl"
                          >
                            <FiGrid className="w-4 h-4 text-brand-orange" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <Link 
                          to="/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl"
                        >
                          <FiUser className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        
                        <Link 
                          to="/orders" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl"
                        >
                          <FiShoppingBag className="w-4 h-4 text-brand" />
                          <span>My Orders</span>
                        </Link>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left text-brand hover:bg-brand/5 rounded-xl mt-1"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1.5 bg-gradient-to-r from-brand to-brand-orange text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-brand/20 hover:shadow-brand-orange/40 hover:scale-105 active:scale-95 transition-all"
              >
                <FiUser className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Theme Toggle Mobile */}
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            
            {/* Shopping Cart Mobile */}
            <Link to="/cart" className="relative p-2 text-slate-600 dark:text-slate-300">
              <FiShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand text-[8px] text-white font-extrabold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Toggle Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <NavLink 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-brand/5 hover:text-brand"
              >HOME</NavLink>
              
              <NavLink 
                to="/menu" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-brand/5 hover:text-brand"
              >MENU</NavLink>
              
              <NavLink 
                to="/build-pizza" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-brand/5 hover:text-brand"
              >BUILD PIZZA</NavLink>

              <hr className="border-slate-200 dark:border-slate-800 my-2" />

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-brand-orange"
                    >Admin Dashboard</Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >My Profile</Link>
                  
                  <Link 
                    to="/orders" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >My Orders</Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5 rounded-xl"
                  >Logout</button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-brand text-white font-bold py-3 rounded-full shadow-lg"
                >Login / Register</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
