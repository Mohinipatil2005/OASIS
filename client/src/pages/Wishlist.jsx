import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';
import { FiHeart, FiHeart as FiHeartOutline } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/users/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Watch for any favorites removed from within the grid to refresh list
  const handleRemoveCallback = () => {
    fetchWishlist();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen animate-pulse space-y-6">
        <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen space-y-8">
      <h1 className="text-3xl font-extrabold flex items-center space-x-2">
        <FiHeart className="text-brand fill-brand" />
        <span>My Favorite Pizzas</span>
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
          <span className="text-6xl select-none">💖</span>
          <h3 className="text-xl font-bold mt-4">Wishlist is Empty</h3>
          <p className="text-sm text-slate-400 font-sans mt-1">Browse our menu and click the heart icon on any pizza to save it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {wishlist.map((pizza) => (
            // Bind double click or listen to events if they modify wishlist to reload
            <div key={pizza._id} onClick={handleRemoveCallback}>
              <PizzaCard pizza={pizza} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Wishlist;
