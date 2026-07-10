import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTruck, FiAward, FiHeart, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';

export const Landing = () => {
  const [emailInput, setEmailInput] = useState('');
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loadingPizzas, setLoadingPizzas] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // GSAP Refs
  const heroRef = useRef(null);
  const pizzaRef = useRef(null);
  const heroPriceRef = useRef(null);
  const titleContainerRef = useRef(null);

  // Hero Pizza Showcase Slides (4 Top Pizzas with dynamic background themes)
  const heroPizzas = [
    {
      name: 'Double Cheese Margherita',
      price: 239,
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=500&auto=format&fit=crop',
      bgClass: 'from-emerald-500/10 via-slate-50 to-transparent dark:from-emerald-950/20 dark:to-transparent',
      accentColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      name: 'Detroit Crispy Pepperoni',
      price: 529,
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=500&auto=format&fit=crop',
      bgClass: 'from-rose-500/10 via-slate-50 to-transparent dark:from-rose-950/20 dark:to-transparent',
      accentColor: 'text-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-500'
    },
    {
      name: 'Farmhouse Fresh Veggie',
      price: 299,
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=500&auto=format&fit=crop',
      bgClass: 'from-amber-500/10 via-slate-50 to-transparent dark:from-amber-950/20 dark:to-transparent',
      accentColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-500'
    },
    {
      name: 'Chicken Maxxx Feast',
      price: 459,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500&auto=format&fit=crop',
      bgClass: 'from-orange-500/10 via-slate-50 to-transparent dark:from-orange-950/20 dark:to-transparent',
      accentColor: 'text-brand',
      badgeBg: 'bg-brand/10 text-brand'
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

  // Fetch pizzas for the front-page menu
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get('/pizzas', { params: { limit: 12 } });
        if (res.data.success) {
          setFeaturedPizzas(res.data.pizzas);
        }
      } catch (err) {
        console.warn('Failed to load menu pizzas for home page', err.message);
        // Load fallback generated pizzas if API fails
        const { MOCK_PIZZAS } = await import('../utils/mockPizzas');
        setFeaturedPizzas(MOCK_PIZZAS);
      } finally {
        setLoadingPizzas(false);
      }
    };
    fetchPizzas();
  }, []);

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

    // Out animation
    gsap.to(pizzaRef.current, {
      opacity: 0,
      scale: 0.96,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setActiveHeroIdx(idx);
        // In animation
        gsap.to(pizzaRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: 'back.out(1.1)'
        });
      }
    });

    // Pop the price tag
    gsap.fromTo(heroPriceRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.15 }
    );
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

  const filteredPizzas = featuredPizzas.filter(pizza => {
    if (activeTab === 'All') return true;
    return pizza.category === activeTab;
  });

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
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                Devour The <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-orange">
                  Extraordinary.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto lg:mx-0">
                Fresh, hot, customizable pizzas baked in traditional wood-fired ovens. Build your own pizza recipe from our rich inventory of toppings and crusts.
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

      {/* What are you craving for? Category Grid */}
      <section className="py-12 bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-slate-100 mb-8 font-sans">
            What are you craving for?
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-8 gap-x-4">
            {cravingCategories.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setActiveTab(item.filter);
                  // Scroll to home-menu
                  document.getElementById('home-menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex flex-col items-center cursor-pointer select-none text-center hover:scale-105 transition-transform"
              >
                
                {/* Circle image container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200/60 dark:border-slate-800/80 group-hover:border-brand shadow-sm transition-all duration-300">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Yellow NEW badge */}
                  {item.isNew && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#ffc107] text-[7px] font-black text-slate-900 px-2 py-0.5 rounded-b-md uppercase tracking-wider scale-95 shadow-sm">
                      NEW
                    </span>
                  )}

                  {/* Veg / Non-Veg Indicator Dot */}
                  {item.indicator && (
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-950 p-0.5 rounded-sm border border-slate-200 dark:border-slate-800">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        item.indicator === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                      }`}></div>
                    </div>
                  )}

                </div>

                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mt-2.5 group-hover:text-brand transition-colors leading-tight max-w-[100px]">
                  {item.name}
                </span>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Dynamic Pizzas Menu Section */}
      <section id="home-menu" className="py-20 bg-white dark:bg-darkBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold">Explore Our Pizzas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans">
              Choose from our pre-designed chef specials or launch the custom builder.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['All', 'Meals Under 99', 'Paneer Maxxx', 'Chicken Maxxx', 'Big Big Pizza', 'Veg Pizza', 'Non-Veg Pizza', 'Pizza Mania', 'Crazy Deals', 'Sourdough Range', 'Party Combos', 'Chicken Feast', 'Garlic Breads & Dips'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all select-none ${
                  activeTab === tab 
                    ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Pizza Grid */}
          {loadingPizzas ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl glass overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-md p-5 space-y-4 animate-pulse">
                  <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-full w-32 h-32 mx-auto"></div>
                  <div className="w-2/3 h-5 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto"></div>
                  <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : filteredPizzas.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/30 rounded-3xl">
              <p className="text-sm text-slate-400">No pizzas available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {filteredPizzas.map((pizza) => (
                <PizzaCard key={pizza._id} pizza={pizza} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/menu"
              className="inline-flex items-center space-x-2 border-2 border-brand text-brand hover:bg-brand hover:text-white font-extrabold px-8 py-3.5 rounded-full transition-all"
            >
              <span>View Full Catalog</span>
              <FiArrowRight />
            </Link>
          </div>

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

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-darkBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold">What Our Foodies Say</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans">
              Don't just take our word for it. Read the verified reviews of our pizza enthusiasts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl glass hover-card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 font-bold flex items-center justify-center text-slate-700">A</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Aditya Roy</h4>
                  <span className="text-[10px] text-slate-400 font-sans">Verified Customer</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans italic leading-relaxed">
                "The Cheese Burst crust is out of this world! It arrived piping hot within 25 minutes. Love their Custom Pizza Builder tool, it makes ordering very fun."
              </p>
            </div>
            
            <div className="p-6 rounded-2xl glass hover-card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 font-bold flex items-center justify-center text-slate-700">R</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Riya Sharma</h4>
                  <span className="text-[10px] text-slate-400 font-sans">Food Blogger</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans italic leading-relaxed">
                "As a vegan, finding good cheese options is hard. Pizza Hut has dedicated Vegan Mozzarella that melts beautifully. High quality toppings."
              </p>
            </div>

            <div className="p-6 rounded-2xl glass hover-card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 font-bold flex items-center justify-center text-slate-700">K</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Karan Patel</h4>
                  <span className="text-[10px] text-slate-400 font-sans">Regular Customer</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans italic leading-relaxed">
                "Their Pepperoni Feast is loaded. No stingy toppings here! Plus, their tracking page is updated in real time via sockets, which is amazing."
              </p>
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
