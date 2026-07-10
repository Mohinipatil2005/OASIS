import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiStar, FiShoppingCart, FiSliders, FiMessageSquare } from 'react-icons/fi';

export const PizzaDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('Medium');
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchPizzaDetails = async () => {
    try {
      const res = await api.get(`/pizzas/${id}`);
      if (res.data.success) {
        setPizza(res.data.pizza);
      }
    } catch (err) {
      console.warn('Failed to load remote details, falling back to mock.');
      try {
        const { MOCK_PIZZAS } = await import('../utils/mockPizzas');
        const found = MOCK_PIZZAS.find(p => p._id === id);
        if (found) {
          setPizza(found);
        } else {
          toast.error('Failed to load pizza details');
        }
      } catch (mockErr) {
        toast.error('Failed to load pizza details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzaDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="w-full h-80 sm:h-[450px] rounded-3xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="space-y-6">
            <div className="w-1/3 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="w-2/3 h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="w-1/2 h-10 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pizza) {
    return (
      <div className="text-center py-20 min-h-[70vh]">
        <h3 className="text-xl font-bold">Pizza Product Not Found</h3>
        <Link to="/menu" className="text-brand font-bold hover:underline mt-2 inline-block">Back to Menu</Link>
      </div>
    );
  }

  // Adjust price based on size selection
  const getPriceForSize = () => {
    if (size === 'Small') return Math.max(pizza.price - 50, 99);
    if (size === 'Large') return pizza.price + 100;
    return pizza.price;
  };

  const currentPrice = getPriceForSize();

  const handleAddToCart = () => {
    const cartItem = {
      pizza: pizza._id,
      name: pizza.name,
      price: currentPrice,
      quantity,
      size,
      isCustomized: false
    };
    addToCart(cartItem);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      toast.error('Please enter a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/pizzas/${id}/reviews`, { rating, comment });
      if (res.data.success) {
        toast.success(res.data.message);
        setComment('');
        setRating(5);
        // Refresh details to update reviews listing
        fetchPizzaDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Upper Grid: Details & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
        
        {/* Pizza Image */}
        <div className="w-full rounded-[32px] overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/80">
          <img src={pizza.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop'} alt={pizza.name} className="w-full h-80 sm:h-[450px] object-cover select-none" />
        </div>

        {/* Configurations */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              pizza.category === 'Veg' ? 'bg-emerald-500 text-white' : 'bg-brand text-white'
            }`}>
              {pizza.category}
            </span>
            <div className="flex items-center text-brand-orange font-bold text-xs">
              <FiStar className="fill-brand-orange mr-1" />
              <span>{pizza.ratings?.average?.toFixed(1) || '0.0'} ({pizza.ratings?.count || 0} reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">{pizza.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">{pizza.description}</p>

          {/* Ingredients Recipe */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Base Ingredients:</h3>
            <div className="flex flex-wrap gap-2">
              {pizza.ingredients?.map((item, idx) => (
                <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-3 py-1.5 rounded-xl font-sans">
                  {item.ingredient?.name || 'Gourmet Crust'}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Size Selectors */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Choose Size</label>
            <div className="flex space-x-3">
              {['Small', 'Medium', 'Large'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    size === s 
                      ? 'border-brand bg-brand/5 dark:bg-brand/10 text-brand' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantities & Price Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            
            {/* Price */}
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Price for {size}</span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">₹{currentPrice * quantity}</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl shrink-0 select-none">
              <button 
                onClick={() => setQuantity(q => Math.max(q - 1, 1))}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold"
              >-</button>
              <span className="font-extrabold text-sm w-4 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold"
              >+</button>
            </div>

            {/* Add Triggers */}
            <div className="flex space-x-2 w-full sm:w-auto">
              {pizza.isCustomizable && (
                <Link 
                  to={`/build-pizza?pizzaId=${pizza._id}`}
                  className="flex items-center justify-center p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand"
                  title="Customize ingredients"
                >
                  <FiSliders className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!pizza.isAvailable}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
              >
                <FiShoppingCart />
                <span>{pizza.isAvailable ? 'Add To Cart' : 'Sold Out'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* Lower Section: Review Lists & Submission form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-extrabold flex items-center space-x-2">
            <FiMessageSquare className="text-brand" />
            <span>Customer Reviews ({pizza.reviews?.length || 0})</span>
          </h2>

          <div className="space-y-4">
            {pizza.reviews?.length === 0 ? (
              <p className="text-sm text-slate-400 font-sans italic">No reviews yet for this pizza. Be the first to review!</p>
            ) : (
              pizza.reviews?.map((rev) => (
                <div key={rev._id} className="p-5 rounded-2xl glass border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{rev.userName}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-brand-orange text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} className={i < rev.rating ? 'fill-brand-orange' : 'text-slate-300 dark:text-slate-700'} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Review */}
        <div>
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-lg space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Add a Review</h3>
            
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating Select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your Rating</label>
                  <div className="flex space-x-1.5 text-2xl cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar 
                        key={star}
                        onClick={() => setRating(star)}
                        className={star <= rating ? 'text-brand-orange fill-brand-orange' : 'text-slate-300 dark:text-slate-700'} 
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Review Comment</label>
                  <textarea 
                    rows="4"
                    placeholder="Tell us what you liked/disliked..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-850/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand font-sans text-xs"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="w-full bg-brand text-white font-extrabold py-3 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wider text-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-400 font-sans leading-relaxed">You must be logged in to share your experience with other foodies.</p>
                <Link to="/login" className="inline-block bg-brand/10 hover:bg-brand/20 text-brand font-bold text-xs px-6 py-2.5 rounded-full transition-all">Login Now</Link>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default PizzaDetails;
