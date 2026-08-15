import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTruck, FiAward, FiHeart, FiTrendingUp, FiSearch, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';

export const Landing = () => {
  const [emailInput, setEmailInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [pizzas, setPizzas] = useState([]);
  const [categories, setCategories] = useState(['Veg', 'Non-Veg', 'Sides', 'Beverages']);
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'Veg';
  const sort = searchParams.get('sort') || '-createdAt';
  const [searchInput, setSearchInput] = useState(search);
  const [totalPages, setTotalPages] = useState(1);

  // GSAP Refs
  const heroRef = useRef(null);
  const pizzaRef = useRef(null);
  const heroPriceRef = useRef(null);
  const titleContainerRef = useRef(null);

  // Hero Pizza Showcase Slides (4 Top Pizzas with dynamic background themes and descriptions)
  const heroPizzas = [
    {
      name: 'BBQ Chicken Pizza',
      price: 399,
      image: 'https://res.cloudinary.com/dhc4icfi6/image/upload/v1783802415/pizzas/sf8rmbupyqdxcugumf1f.jpg',
      description: 'Tangy tomato sauce with tandoori marinated chicken breast and premium melted cheese.',
      bgClass: 'from-orange-500/10 via-slate-50 to-transparent dark:from-orange-950/20 dark:to-transparent',
      accentColor: 'text-brand',
      badgeBg: 'bg-brand/10 text-brand'
    },
    {
      name: 'Pepperoni Pizza',
      price: 500,
      image: 'https://res.cloudinary.com/dhc4icfi6/image/upload/v1783845355/pizzas/wbloapajalriwbif1zmk.webp',
      description: 'Classic favorite loaded with premium crispy pepperoni slices and extra melted mozzarella.',
      bgClass: 'from-rose-500/10 via-slate-50 to-transparent dark:from-rose-950/20 dark:to-transparent',
      accentColor: 'text-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-500'
    },
    {
      name: 'Farmhouse Pizza',
      price: 150,
      image: 'https://res.cloudinary.com/dhc4icfi6/image/upload/v1783803985/pizzas/q4bwcdjnvht5qg1sskj3.webp',
      description: 'Loaded with crunchy capsicum, red onions, mushrooms, and sweet corn on hand-tossed base.',
      bgClass: 'from-amber-500/10 via-slate-50 to-transparent dark:from-amber-950/20 dark:to-transparent',
      accentColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-500'
    },
    {
      name: 'Paneer Pizza',
      price: 200,
      image: 'https://res.cloudinary.com/dhc4icfi6/image/upload/v1783802612/pizzas/xorlnzaohwabdwfrhmnd.jpg',
      description: 'Spicy tandoori marinated paneer cubes layered with capsicum and hot green chilies.',
      bgClass: 'from-emerald-500/10 via-slate-50 to-transparent dark:from-emerald-950/20 dark:to-transparent',
      accentColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-500'
    }
  ];

  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // Craving categories mirroring Domino's layout screenshot
  const cravingCategories = [
    { name: 'Meals Under 99', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=200&auto=format&fit=crop', filter: 'Meals Under 99' },
    { name: 'Paneer Maxxx', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop', filter: 'Paneer Maxxx', isNew: true },
    { name: 'Chicken Maxxx', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&auto=format&fit=crop', filter: 'Chicken Maxxx', isNew: true },
    { name: 'Big Big Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop', filter: 'Big Big Pizza' },
    { name: 'Veg Pizza', image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=200&auto=format&fit=crop', filter: 'Veg Pizza', indicator: 'veg' },
    { name: 'Non-Veg Pizza', image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=200&auto=format&fit=crop', filter: 'Non-Veg Pizza', indicator: 'nonveg' },
    { name: 'Pizza Mania', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=200&auto=format&fit=crop', filter: 'Pizza Mania' },
    { name: 'Crazy Deals', image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=200&auto=format&fit=crop', filter: 'Crazy Deals' },
    { name: 'Sourdough Range', image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?q=200&w=200&auto=format&fit=crop', filter: 'Sourdough Range' },
    { name: 'Party Combos', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=200&auto=format&fit=crop', filter: 'Party Combos' },
    { name: 'Chicken Feast', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&auto=format&fit=crop', filter: 'Chicken Feast', isNew: true },
    { name: 'Garlic Breads & Dips', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?q=80&w=200&auto=format&fit=crop', filter: 'Garlic Breads & Dips' }
  ];

  // Fetch pizzas based on parameters (search, sort, category, page)
  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 12,
          page,
          sort
        };
        if (search) params.search = search;
        if (category && category !== 'All') params.category = category;

        const res = await api.get('/pizzas', { params });
        if (res.data.success) {
          setPizzas(res.data.pizzas);
          setTotalPages(res.data.pagination.pages);
        }
      } catch (err) {
        console.error('Error fetching pizzas:', err.message);
        const { MOCK_PIZZAS } = await import('../utils/mockPizzas');
        setPizzas(MOCK_PIZZAS);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [page, search, category, sort]);

  // GSAP 3D Mouse Parallax effect on Hero (Subtle and clean)
  useEffect(() => {
    const hero = heroRef.current;
    const pizza = pizzaRef.current;
    const titleContainer = titleContainerRef.current;

    if (!hero || !pizza) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = hero.getBoundingClientRect();
      
      const x = clientX - left - width / 2;
      const y = clientY - top - height / 2;

      // Subtle tilt
      const tiltX = (y / (height / 2)) * 6;
      const tiltY = -(x / (width / 2)) * 6;

      gsap.to(pizza, {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.5
      });

      if (titleContainer) {
        gsap.to(titleContainer, {
          x: (x / (width / 2)) * 12,
          y: (y / (height / 2)) * 12,
          ease: 'power2.out',
          duration: 0.6
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(pizza, {
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out',
        duration: 0.8
      });
      if (titleContainer) {
        gsap.to(titleContainer, {
          x: 0,
          y: 0,
          ease: 'power3.out',
          duration: 0.8
        });
      }
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeHeroIdx]);

  // GSAP Automatic 3-Second Cycle Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIdx = (activeHeroIdx + 1) % 4;
      handleHeroPizzaChange(nextIdx);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeHeroIdx]);

  // GSAP Pizza Showcase click animations (Clean crossfade & scale transitions, no heavy spin)
  const handleHeroPizzaChange = (idx) => {
    if (idx === activeHeroIdx) return;

    const pizza = pizzaRef.current;
    const heroPrice = heroPriceRef.current;

    if (pizza) {
      // Out animation
      gsap.to(pizza, {
        opacity: 0,
        scale: 0.96,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          setActiveHeroIdx(idx);
          // In animation
          if (pizzaRef.current) {
            gsap.to(pizzaRef.current, {
              opacity: 1,
              scale: 1,
              duration: 0.45,
              ease: 'back.out(1.1)'
            });
          }
        }
      });
    } else {
      setActiveHeroIdx(idx);
    }

    // Pop the price tag
    if (heroPrice) {
      gsap.fromTo(heroPrice,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.15 }
      );
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to our newsletter!');
    setEmailInput('');
  };

  const offers = [
    { code: 'PIZZA50', title: '50% Off First Order', desc: 'Get half off on your very first order. Valid on all handcrafted pizzas.', color: 'from-pink-500 to-rose-600' },
    { code: 'WELCOME100', title: '₹100 flat discount', desc: 'Flat ₹100 cash back on orders above ₹400. Use code at checkout.', color: 'from-amber-500 to-orange-600' },
    { code: 'FREESHIP', title: 'Free Home Delivery', desc: 'Get free instant shipping on your custom pizzas. Save ₹40 flat.', color: 'from-emerald-500 to-teal-600' }
  ];

  const features = [
    { icon: <FiTruck className="w-8 h-8 text-brand" />, title: '30 Min Delivery', desc: 'Baking to doorstep in half an hour or it is completely free!' },
    { icon: <FiAward className="w-8 h-8 text-brand-orange" />, title: 'Premium Ingredients', desc: 'Aged mozzarella cheese, wood-fired crusts, and organic farm-fresh veggies.' },
    { icon: <FiHeart className="w-8 h-8 text-rose-500" />, title: 'Handcrafted With Love', desc: 'Every pizza is individually tossed and prepared by top chefs.' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchParams.set('search', searchInput);
    searchParams.set('page', '1'); // reset page
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (cat) => {
    searchParams.set('category', cat);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleSortSelect = (e) => {
    searchParams.set('sort', e.target.value);
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  const activeHeroPizza = heroPizzas[activeHeroIdx];

  return (
    <div className="w-full overflow-hidden">
      
      {/* 3D Interactive Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center pt-8 pb-16 transition-all duration-700 ease-in-out dark:bg-darkBg overflow-hidden"
        style={{ perspective: '1200px' }}
      >
        {/* Dynamic theme background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${activeHeroPizza.bgClass} pointer-events-none transition-all duration-700`}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Left (Text & Buttons) */}
            <div 
              ref={titleContainerRef}
              className="space-y-6 text-center lg:text-left transition-all duration-100"
            >
              <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors duration-700 ${activeHeroPizza.badgeBg}`}>
                <FiTrendingUp />
                <span>WELCOME TO PIZZA-HUT</span>
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight min-h-[140px] flex flex-col justify-center">
                <span>Devour The</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-orange">
                  {activeHeroPizza.name}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto lg:mx-0 min-h-[56px] leading-relaxed">
                {activeHeroPizza.description}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                <a 
                  href="#home-menu" 
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brand text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Explore Menu</span>
                  <FiArrowRight />
                </a>
                <Link 
                  to="/build-pizza" 
                  className="w-full sm:w-auto text-center border-2 border-slate-200 dark:border-slate-800 hover:border-brand dark:hover:border-brand font-extrabold px-8 py-4 rounded-full transition-all"
                >
                  Build Custom Pizza
                </Link>
              </div>
            </div>

            {/* Hero Right (GSAP 3D Interactive Carousel) */}
            <div className="relative flex flex-col items-center">
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-brand-orange/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
              
              {/* Display main pizza - Domino's Circular Cropped style */}
              <div className="relative">
                <div className="w-80 h-80 sm:w-[400px] sm:h-[400px] rounded-full overflow-hidden border-[8px] border-white dark:border-slate-800 shadow-2xl select-none origin-center">
                  <img 
                    ref={pizzaRef}
                    src={activeHeroPizza.image} 
                    alt={activeHeroPizza.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Float price and name badge */}
                <div 
                  ref={heroPriceRef}
                  className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-slate-900/95 text-slate-850 dark:text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between backdrop-blur-md"
                >
                  <div className="text-left">
                    <span className="text-[9px] font-black text-brand uppercase tracking-wider block">Featured Slide</span>
                    <span className="text-xs font-black tracking-tight">{activeHeroPizza.name}</span>
                  </div>
                  <span className="text-xs font-black text-brand-orange bg-brand-orange/10 px-3.5 py-1 rounded-xl border border-brand-orange/20">
                    ₹{activeHeroPizza.price}
                  </span>
                </div>
              </div>

              {/* Pizza Showcase Thumbnails */}
              <div className="flex space-x-3 mt-8 z-20">
                {heroPizzas.map((pizza, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleHeroPizzaChange(idx)}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-sm ${
                      activeHeroIdx === idx ? 'border-brand scale-110 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-brand-orange'
                    }`}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden">
                      <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Menu Catalog Section */}
      <section id="home-menu" className="py-16 bg-white dark:bg-darkBg border-t border-slate-100 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold">Explore Our Pizzas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans">
              Choose from our pre-designed chef specials or launch the custom builder.
            </p>
          </div>

          {/* Top Header Filter controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
              <input 
                type="text" 
                placeholder="Search pizza menu..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-20 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-brand font-sans text-sm"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Search
              </button>
            </form>

            {/* Sort & Quick Filter details */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-sans">
                <FiSliders />
                <span>Sort:</span>
              </div>
              <select 
                value={sort}
                onChange={handleSortSelect}
                className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none font-sans text-xs"
              >
                <option value="-createdAt">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Top Customer Rated</option>
              </select>
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto space-x-2 pb-6 border-b border-slate-200/50 dark:border-slate-800/80 mb-8 scrollbar-thin scrollbar-thumb-rounded">
            {categories.map((cat, idx) => {
              const isActive = cat === category;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all select-none shrink-0 ${
                    isActive 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Pizzas Catalog Grid */}
          {loading ? (
            // Skeleton loader grid
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-3xl glass overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-md p-5 space-y-4">
                  <div className="w-full h-40 rounded-2xl shimmer"></div>
                  <div className="w-2/3 h-5 rounded-md shimmer"></div>
                  <div className="w-full h-10 rounded-md shimmer"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="w-16 h-6 rounded-md shimmer"></div>
                    <div className="w-24 h-9 rounded-md shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pizzas.length === 0 ? (
            // Empty State
            <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-6xl select-none">🍕</span>
              <h3 className="text-xl font-bold mt-4">No Pizza Found</h3>
              <p className="text-sm text-slate-400 font-sans mt-1">We couldn't find any pizzas matching your criteria. Try adjusting filters.</p>
            </div>
          ) : (
            // Catalog Grid
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {pizzas.map((pizza) => (
                  <PizzaCard key={pizza._id} pizza={pizza} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:border-brand disabled:opacity-40 disabled:hover:border-slate-200 transition-colors"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:border-brand disabled:opacity-40 disabled:hover:border-slate-200 transition-colors"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold">Hot Deals & Coupon Offers</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans">
              Save big on your next meal. Simply apply these coupon codes during your checkout.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offers.map((offer, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-3xl bg-gradient-to-br ${offer.color} text-white shadow-md flex flex-col justify-between h-56 hover:scale-[1.02] transition-transform duration-300`}
              >
                <div>
                  <span className="bg-white/20 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">OFFER</span>
                  <h3 className="text-xl font-extrabold mt-3">{offer.title}</h3>
                  <p className="text-xs text-white/80 mt-1 font-sans leading-relaxed">{offer.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-4">
                  <span className="text-xs font-bold text-white/90">Coupon Code:</span>
                  <span 
                    onClick={() => {
                      navigator.clipboard.writeText(offer.code);
                      toast.success(`Copied code: ${offer.code}`);
                    }}
                    className="cursor-pointer bg-white text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl hover:scale-105 transition-all tracking-wider"
                  >
                    {offer.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-darkBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-2xl glass hover-card hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Call To Action - Custom Builder Promo */}
      <section className="py-16 bg-gradient-to-br from-brand/5 to-brand-orange/5 dark:from-brand/10 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 glass rounded-[32px] border border-slate-200/50 dark:border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Create Your Masterpiece</h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-sans max-w-lg leading-relaxed">
                  Choose your crust, sauce, cheese, and multiple choices of farm fresh vegetables and meat toppings. Get real-time price calculations and inventory availability directly.
                </p>
                <div className="pt-2">
                  <Link 
                    to="/build-pizza" 
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <span>Launch Pizza Builder</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=400&auto=format&fit=crop" 
                  alt="Assorted toppings on Pizza preparation board" 
                  className="w-72 sm:w-80 rounded-2xl shadow-xl select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-extrabold">Never Miss a Pizza Deal</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans">
            Subscribe to our newsletter to receive secret coupons, stock refills, and new menu additions.
          </p>
          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="px-6 py-4 w-full sm:max-w-md rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand font-sans"
            />
            <button 
              type="submit" 
              className="bg-brand text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Landing;
