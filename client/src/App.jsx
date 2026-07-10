import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Components & Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/AdminLayout';

// Customer Pages
import Landing from './pages/Landing';
import Menu from './pages/Menu';
import PizzaDetails from './pages/PizzaDetails';
import BuildPizza from './pages/BuildPizza';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';

// General Customer Pages Layout wrapper
const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                
                {/* Customer Storefront Routes */}
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<Landing />} />
                  <Route path="menu" element={<Menu />} />
                  <Route path="pizza/:id" element={<PizzaDetails />} />
                  <Route path="build-pizza" element={<BuildPizza />} />
                  <Route path="cart" element={<Cart />} />
                  
                  {/* Protected Customer Routes */}
                  <Route path="checkout" element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  } />
                  <Route path="payment-success/:orderId" element={
                    <PrivateRoute>
                      <PaymentSuccess />
                    </PrivateRoute>
                  } />
                  <Route path="dashboard" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="orders" element={
                    <PrivateRoute>
                      <OrderHistory />
                    </PrivateRoute>
                  } />
                  <Route path="wishlist" element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  } />

                  {/* Auth pages */}
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="verify-otp" element={<VerifyOTP />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />

                  {/* Information & Compliance */}
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms-conditions" element={<Terms />} />
                  
                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Panel Panel Routes */}
                <Route path="/admin" element={
                  <PrivateRoute adminOnly={true}>
                    <AdminLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

              </Routes>
            </Router>

            {/* Application Toast Alerts layer */}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'Outfit, sans-serif',
                  borderRadius: '16px',
                  padding: '12px 18px',
                  border: '1px solid rgba(255,255,255,0.08)'
                },
                success: {
                  iconTheme: {
                    primary: '#2ed573',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ff4757',
                    secondary: '#fff'
                  }
                }
              }}
            />
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
