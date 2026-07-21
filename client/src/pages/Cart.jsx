import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiShoppingBag, FiTag, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Cart = () => {
  const { 
    cartItems, 
    updateCartItemQuantity, 
    removeFromCart, 
    subtotal, 
    discount, 
    total, 
    coupon, 
    applyCouponCode, 
    removeCoupon 
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');

  const handleCouponApply = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const success = applyCouponCode(couponInput);
    if (success) {
      setCouponInput('');
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5 min-h-[70vh]">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-3xl select-none">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 font-sans leading-relaxed">
          Looks like you haven't added any handcrafted pizzas to your cart yet. Let's find something delicious!
        </p>
        <Link 
          to="/menu" 
          className="inline-flex items-center justify-center space-x-2 bg-brand text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg"
        >
          <span>Browse Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center space-x-2">
        <FiShoppingBag className="text-brand" />
        <span>Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <div 
              key={index}
              className="p-4 sm:p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              
              {/* Product Info */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : item.isCustomized ? (
                    <div className="w-full h-full bg-brand-orange/10 flex items-center justify-center text-2xl select-none">
                      🍕
                    </div>
                  ) : (
                    <div className="w-full h-full bg-brand/10 flex items-center justify-center text-2xl select-none">
                      🍕
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{item.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Size: {item.size}
                  </p>
                  
                  {item.isCustomized && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate max-w-xs sm:max-w-sm">
                      {item.customizationDetails.base} Base, {item.customizationDetails.cheese} Cheese
                      {item.customizationDetails.veggies.length > 0 && `, Veggies: ${item.customizationDetails.veggies.join(', ')}`}
                      {item.customizationDetails.toppings.length > 0 && `, Toppings: ${item.customizationDetails.toppings.join(', ')}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0">
                
                {/* Quantity */}
                <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl select-none">
                  <button 
                    onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-xs"
                  >-</button>
                  <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-xs"
                  >+</button>
                </div>

                {/* Subtotal */}
                <span className="font-black text-sm text-slate-800 dark:text-slate-100 w-16 text-right">
                  ₹{item.price * item.quantity}
                </span>

                {/* Delete */}
                <button 
                  onClick={() => removeFromCart(index)}
                  className="p-2 text-slate-400 hover:text-brand transition-colors focus:outline-none"
                  title="Remove from cart"
                >
                  <FiTrash2 className="w-4.5 h-4.5" />
                </button>

              </div>

            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Order Summary</h3>
            
            <div className="space-y-2.5 text-xs font-sans">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-emerald-500 font-bold">
                  <div className="flex items-center space-x-1">
                    <FiTag />
                    <span>Coupon ({coupon.code})</span>
                  </div>
                  <span>-₹{discount}</span>
                </div>
              )}

              <hr className="border-slate-200 dark:border-slate-800/80 my-1" />

              <div className="flex justify-between text-slate-800 dark:text-slate-100 text-base font-extrabold pt-1">
                <span>Total Amount</span>
                <span className="text-brand">₹{total}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            {coupon ? (
              <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-500 text-xs px-3.5 py-2.5 rounded-xl border border-emerald-500/20 font-sans">
                <span className="font-bold">Code applied: {coupon.code}</span>
                <button onClick={removeCoupon} className="p-1 focus:outline-none"><FiX /></button>
              </div>
            ) : (
              <form onSubmit={handleCouponApply} className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="px-4 py-2.5 w-full rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand font-sans text-xs uppercase"
                />
                <button 
                  type="submit" 
                  className="bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase"
                >
                  Apply
                </button>
              </form>
            )}

            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold py-3.5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest mt-4"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
