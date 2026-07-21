import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiPhone, FiCreditCard, FiArrowRight, FiX } from 'react-icons/fi';

export const Checkout = () => {
  const { user, addAddress } = useAuth();
  const { cartItems, total, coupon, clearCart, discount } = useCart();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(() => {
    const defaultIdx = user?.addresses?.findIndex(a => a.isDefault);
    return defaultIdx > -1 ? defaultIdx : 0;
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressInput, setAddressInput] = useState({
    street: '', city: '', state: '', zipCode: '', phone: ''
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Sandbox payment modal simulator states
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [activePaymentOrderDetails, setActivePaymentOrderDetails] = useState(null);

  // Utility: Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { street, city, state, zipCode, phone } = addressInput;
    if (!street || !city || !state || !zipCode || !phone) {
      toast.error('All address fields are required.');
      return;
    }

    try {
      const currentAddresses = user?.addresses || [];
      await addAddress({ ...addressInput, isDefault: currentAddresses.length === 0 });
      toast.success('Address added successfully.');
      setAddressInput({ street: '', city: '', state: '', zipCode: '', phone: '' });
      setShowAddressForm(false);
      setSelectedAddressIndex(currentAddresses.length); // select newly added address
    } catch (err) {
      toast.error('Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    const activeAddress = user?.addresses?.[selectedAddressIndex];
    if (!activeAddress) {
      toast.error('Please select or add a shipping address.');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map(i => ({
          pizza: i.pizza,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
          isCustomized: i.isCustomized,
          customizationDetails: i.customizationDetails
        })),
        shippingAddress: {
          street: activeAddress.street,
          city: activeAddress.city,
          state: activeAddress.state,
          zipCode: activeAddress.zipCode,
          phone: activeAddress.phone || activeAddress.zipCode // fallback
        },
        couponCode: coupon?.code || ''
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        const { order, razorpayOrder } = res.data;

        // Check if Razorpay is mocked on the backend
        if (razorpayOrder.isMock) {
          // Open the sandbox simulation panel
          setActivePaymentOrderDetails({ orderId: order._id, razorpayOrder });
          setShowMockPaymentModal(true);
        } else {
          // Trigger the standard Razorpay checkout flow
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            toast.error('Failed to load payment gateway script. Check your internet connection.');
            setPlacingOrder(false);
            return;
          }

          const options = {
            key: res.data.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
            amount: razorpayOrder.amount,
            currency: 'INR',
            name: 'PizzaGo Delivery',
            description: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
            order_id: razorpayOrder.id,
            handler: async (response) => {
              try {
                const verifyRes = await api.post('/orders/verify', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });

                if (verifyRes.data.success) {
                  toast.success('Payment completed successfully.');
                  clearCart();
                  navigate(`/payment-success/${order._id}`);
                }
              } catch (verifyErr) {
                toast.error(verifyErr.response?.data?.message || 'Payment verification failed.');
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: activeAddress.phone
            },
            theme: {
              color: '#ff4757'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            toast.error(`Payment Failed: ${response.error.description}`);
          });
          rzp.open();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!activePaymentOrderDetails) return;
    const { orderId, razorpayOrder } = activePaymentOrderDetails;
    setShowMockPaymentModal(false);

    try {
      const verifyRes = await api.post('/orders/verify', {
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 17)}`,
        razorpaySignature: 'mock_signature_approved'
      });

      if (verifyRes.data.success) {
        toast.success('Simulated transaction approved.');
        clearCart();
        navigate(`/payment-success/${orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sandbox verification failed.');
    }
  };

  const simulatePaymentFailure = () => {
    setShowMockPaymentModal(false);
    toast.error('Simulated transaction cancelled.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8">Checkout Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Address & Payment sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Panel */}
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
                <FiMapPin className="text-brand" />
                <span>Shipping Address</span>
              </h2>
              {!showAddressForm && (
                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  + Add New Address
                </button>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="text" placeholder="Street Address" value={addressInput.street}
                    onChange={(e) => setAddressInput({...addressInput, street: e.target.value})}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                  <input 
                    type="text" placeholder="City" value={addressInput.city}
                    onChange={(e) => setAddressInput({...addressInput, city: e.target.value})}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                  <input 
                    type="text" placeholder="State" value={addressInput.state}
                    onChange={(e) => setAddressInput({...addressInput, state: e.target.value})}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                  <input 
                    type="text" placeholder="Zip Code" value={addressInput.zipCode}
                    onChange={(e) => setAddressInput({...addressInput, zipCode: e.target.value})}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                </div>
                <div className="relative max-w-sm">
                  <input 
                    type="text" placeholder="Phone Number" value={addressInput.phone}
                    onChange={(e) => setAddressInput({...addressInput, phone: e.target.value})}
                    className="pl-8 w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="bg-brand text-white font-bold px-5 py-2 rounded-xl text-xs">Save</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="border font-bold px-5 py-2 rounded-xl text-xs">Cancel</button>
                </div>
              </form>
            )}

            {/* Saved Addresses List */}
            {user?.addresses?.length === 0 ? (
              <p className="text-xs text-slate-400 font-sans italic py-4">No shipping addresses saved yet. Please add one above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses?.map((addr, index) => (
                  <div 
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(index)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all text-xs font-sans space-y-1.5 ${
                      selectedAddressIndex === index 
                        ? 'border-brand bg-brand/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Address #{index + 1}</span>
                      {addr.isDefault && <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full text-[9px] uppercase">Default</span>}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <div className="flex items-center space-x-1.5 text-slate-400 pt-1">
                      <FiPhone className="text-[10px]" />
                      <span>{addr.phone || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Panel */}
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <FiCreditCard className="text-brand" />
              <span>Payment Details</span>
            </h2>
            <div className="bg-brand/5 border border-brand/10 p-4 rounded-2xl text-xs font-sans text-brand flex items-center justify-between">
              <span>Razorpay Payment Gateway (Test Mode Enabled)</span>
              <span className="font-extrabold uppercase text-[10px] bg-brand text-white px-3 py-1 rounded-full">Secure</span>
            </div>
          </div>

        </div>

        {/* Order Details & Summary Checkout trigger */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Checkout Summary</h3>

            {/* Subtotal breakdowns */}
            <div className="space-y-2 text-xs font-sans pb-3 border-b border-slate-200 dark:border-slate-850">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>₹{total + discount}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-base font-extrabold pt-2">
              <span>Final Total</span>
              <span className="text-brand text-xl">₹{total}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={placingOrder || cartItems.length === 0}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold py-3.5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-wider mt-4"
            >
              <span>{placingOrder ? 'Processing...' : 'Place Order & Pay'}</span>
              {!placingOrder && <FiArrowRight />}
            </button>
          </div>
        </div>

      </div>

      {/* Sandbox Payment Simulator Modal */}
      <AnimatePresence>
        {showMockPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl text-center space-y-6"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-widest">💰 Payment Simulator</span>
                <button onClick={() => setShowMockPaymentModal(false)} className="p-1 focus:outline-none"><FiX /></button>
              </div>

              <div className="space-y-2">
                <span className="text-4xl select-none">💳</span>
                <h3 className="font-extrabold text-lg">Razorpay Sandbox Simulator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  The backend has created a simulated Razorpay checkout order for **₹{activePaymentOrderDetails?.razorpayOrder?.amount / 100}**. 
                  Please select transaction outcome below to test order updates.
                </p>
              </div>

              <div className="flex flex-col space-y-2.5 pt-2">
                <button 
                  onClick={simulatePaymentSuccess}
                  className="w-full bg-emerald-500 text-white font-extrabold py-3 rounded-2xl hover:bg-emerald-600 transition-colors text-xs uppercase tracking-wider"
                >
                  Simulate Payment Success
                </button>
                <button 
                  onClick={simulatePaymentFailure}
                  className="w-full border text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider"
                >
                  Simulate Payment Failure
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Checkout;
