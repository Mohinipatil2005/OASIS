import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiHeart, FiShoppingCart, FiSliders, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const PizzaCard = ({ pizza }) => {
  const { user, toggleWishlist, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const isWishlisted = user?.wishlist?.includes(pizza._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save favorite pizzas.');
      return;
    }
    toggleWishlist(pizza._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    const cartItem = {
      pizza: pizza._id,
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
      size: 'Medium',
      isCustomized: false
    };
    addToCart(cartItem);
  };

  return (
    <div 
      className="group relative rounded-3xl glass overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-sm hover:shadow-lg dark:hover:shadow-black/35 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      
      {/* Wishlist Heart */}
      <button 
        onClick={handleWishlist}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 hover:text-brand transition-colors focus:outline-none shadow-sm"
        aria-label="Save Favorite"
      >
        <FiHeart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-brand text-brand' : ''}`} />
      </button>

      {/* Pizza Image - Domino's Style Center Circle */}
      <Link to={`/pizza/${pizza._id}`} className="block pt-6 pb-2 text-center relative">
        <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md group-hover:scale-105 group-hover:rotate-12 transition-all duration-500 ease-out origin-center">
          <img 
            src={pizza.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop'} 
            alt={pizza.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <span className={`absolute top-4 left-4 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
          pizza.category === 'Veg' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-brand/10 text-brand border border-brand/20'
        }`}>
          {pizza.category}
        </span>
      </Link>

      {/* Details & Action Drawer */}
      <div className="p-5 pt-2 flex-grow flex flex-col justify-between space-y-3.5">
        
        <div className="space-y-1">
          {/* Ratings badge */}
          <div className="flex items-center space-x-1 text-brand-orange text-xs font-bold">
            <FiStar className="fill-brand-orange text-[10px]" />
            <span>{pizza.ratings?.average?.toFixed(1) || '0.0'}</span>
            <span className="text-slate-400 font-normal">({pizza.ratings?.count || 0})</span>
          </div>

          {/* Title */}
          <Link to={`/pizza/${pizza._id}`} className="block">
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 hover:text-brand transition-colors truncate">
              {pizza.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-[11px] text-slate-450 dark:text-slate-400 font-sans line-clamp-2 leading-relaxed h-8">
            {pizza.description}
          </p>
        </div>

        {/* Pricing tag & Cart controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-base font-black text-slate-850 dark:text-slate-100">
            ₹{pizza.price}
          </span>
          
          <div className="flex space-x-1.5">
            {pizza.isCustomizable && (
              <Link 
                to={`/build-pizza?pizzaId=${pizza._id}`}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:border-brand hover:text-brand transition-colors"
                title="Customize ingredients"
              >
                <FiSliders className="w-3.5 h-3.5" />
              </Link>
            )}
            
            <button 
              onClick={handleAddToCart}
              disabled={!pizza.isAvailable}
              className="flex items-center justify-center space-x-1.5 bg-brand hover:bg-brand-dark text-white font-extrabold px-3 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              <FiShoppingCart className="w-3 h-3" />
              <span>{pizza.isAvailable ? 'ADD' : 'SOLD OUT'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PizzaCard;
