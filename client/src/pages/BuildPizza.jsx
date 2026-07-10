import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight, FiCheck, FiShoppingCart } from 'react-icons/fi';

export const BuildPizza = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [size, setSize] = useState('Medium');

  // Custom Selection States
  const [base, setBase] = useState('Classic');
  const [sauce, setSauce] = useState('Tomato');
  const [cheese, setCheese] = useState('Mozzarella');
  const [veggies, setVeggies] = useState([]);
  const [toppings, setToppings] = useState([]);

  // Pricing details
  const pricing = {
    sizes: { Small: 199, Medium: 249, Large: 299 },
    bases: { Classic: 0, 'Thin Crust': 0, 'Whole Wheat': 20, 'Cheese Burst': 99, 'Stuffed Crust': 79 },
    sauces: { Tomato: 0, Spicy: 0, Garlic: 19, BBQ: 29, Pesto: 29 },
    cheeses: { Mozzarella: 0, Cheddar: 29, Parmesan: 39, Vegan: 49, 'Extra Cheese': 59 },
    veggies: 19, // per item
    toppings: 49 // per item
  };

  const steps = [
    { num: 1, name: 'Base' },
    { num: 2, name: 'Sauce' },
    { num: 3, name: 'Cheese' },
    { num: 4, name: 'Veggies' },
    { num: 5, name: 'Toppings' }
  ];

  const calculateCustomPrice = () => {
    let cost = pricing.sizes[size];
    cost += pricing.bases[base];
    cost += pricing.sauces[sauce];
    cost += pricing.cheeses[cheese];
    cost += veggies.length * pricing.veggies;
    cost += toppings.length * pricing.toppings;
    return cost;
  };

  const currentPrice = calculateCustomPrice();

  const handleVeggieToggle = (veg) => {
    setVeggies(prev => 
      prev.includes(veg) ? prev.filter(v => v !== veg) : [...prev, veg]
    );
  };

  const handleToppingToggle = (top) => {
    setToppings(prev => 
      prev.includes(top) ? prev.filter(t => t !== top) : [...prev, top]
    );
  };

  const handleNext = () => {
    if (activeStep < 5) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 1) setActiveStep(prev => prev - 1);
  };

  const handleAddCustomToCart = () => {
    const customItem = {
      pizza: null, // null denotes custom pizza
      name: 'Custom Pizza',
      price: currentPrice,
      quantity: 1,
      size,
      isCustomized: true,
      customizationDetails: {
        base,
        sauce,
        cheese,
        veggies,
        toppings
      }
    };
    addToCart(customItem);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-orange">
          Custom Pizza Builder
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">
          Design your custom pizza step by step. We build it fresh based on your recipe!
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-10 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto scrollbar-none">
        {steps.map((s) => (
          <div 
            key={s.num} 
            onClick={() => setActiveStep(s.num)}
            className="flex flex-col items-center cursor-pointer shrink-0"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              activeStep === s.num 
                ? 'bg-brand text-white shadow-lg' 
                : activeStep > s.num 
                  ? 'bg-brand-orange text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              {activeStep > s.num ? <FiCheck /> : s.num}
            </div>
            <span className={`text-[10px] uppercase font-bold mt-1 tracking-wider ${
              activeStep === s.num ? 'text-brand' : 'text-slate-400'
            }`}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Left preview, Right configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Pizza Visual Preview Mockup */}
        <div className="glass p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-800/80 shadow-xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden h-[450px]">
          
          {/* Virtual Pizza Canvas */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-amber-900/10 shadow-2xl bg-amber-100 dark:bg-amber-900/10 flex items-center justify-center overflow-hidden transition-all duration-300">
            {/* Visual Crust */}
            <div className="absolute w-[95%] h-[95%] rounded-full bg-orange-200 dark:bg-orange-950/40 border-8 border-orange-300 dark:border-orange-900 transition-all duration-300"></div>
            
            {/* Visual Sauce Layer */}
            {sauce && (
              <div className={`absolute w-[80%] h-[80%] rounded-full transition-colors duration-500 ${
                sauce === 'Tomato' ? 'bg-red-600/80' :
                sauce === 'Spicy' ? 'bg-rose-700/80' :
                sauce === 'Garlic' ? 'bg-yellow-50/70' :
                sauce === 'BBQ' ? 'bg-amber-900/70' : 'bg-green-700/60'
              }`}></div>
            )}

            {/* Visual Cheese Layer */}
            {cheese && (
              <div className={`absolute w-[75%] h-[75%] rounded-full opacity-60 bg-[radial-gradient(circle,rgba(253,253,150,0.8)_20%,transparent_80%)]`}></div>
            )}

            {/* Visual Veggies Emojis */}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center p-6 text-xl pointer-events-none select-none">
              {veggies.includes('Onion') && <span className="absolute top-1/4 left-1/4">🧅</span>}
              {veggies.includes('Capsicum') && <span className="absolute top-1/3 right-1/4">🫑</span>}
              {veggies.includes('Corn') && <span className="absolute bottom-1/4 left-1/3">🌽</span>}
              {veggies.includes('Olives') && <span className="absolute bottom-1/3 right-1/3">🫒</span>}
              {veggies.includes('Mushroom') && <span className="absolute top-1/2 left-1/4">🍄</span>}
              {veggies.includes('Paneer') && <span className="absolute top-1/4 right-1/3">🧀</span>}
              {veggies.includes('Tomato') && <span className="absolute bottom-1/3 left-1/4">🍅</span>}
              {veggies.includes('Jalapeno') && <span className="absolute bottom-1/4 right-1/4">🌶️</span>}
            </div>

            {/* Visual Toppings Emojis */}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center p-6 text-xl pointer-events-none select-none">
              {toppings.includes('Chicken') && <span className="absolute top-[45%] right-[35%]">🍗</span>}
              {toppings.includes('Pepperoni') && <span className="absolute top-[20%] left-[45%]">🔴</span>}
              {toppings.includes('Pepperoni') && <span className="absolute bottom-[35%] left-[45%]">🔴</span>}
              {toppings.includes('Bacon') && <span className="absolute top-[35%] left-[35%]">🥓</span>}
              {toppings.includes('Sausage') && <span className="absolute bottom-[40%] right-[35%]">🥩</span>}
            </div>

          </div>

          {/* Configuration Summary Badge */}
          <div className="text-center font-sans">
            <p className="text-xs text-slate-400">Current Recipe Selection</p>
            <p className="text-sm font-extrabold mt-0.5 truncate max-w-sm">
              {size} Size, {base} Base, {sauce} Sauce, {cheese} Cheese
              {veggies.length > 0 && `, Veggies: ${veggies.join(', ')}`}
              {toppings.length > 0 && `, Toppings: ${toppings.join(', ')}`}
            </p>
          </div>

        </div>

        {/* Configuration Steps Controls */}
        <div className="space-y-6">
          
          {/* Size Choice */}
          <div className="glass p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest mb-2.5">Select Size</span>
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
                  {s} (+₹{pricing.sizes[s]})
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Panel */}
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 min-h-[220px]">
            
            <AnimatePresence mode="wait">
              {/* Step 1: Base */}
              {activeStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <span className="text-xs font-black uppercase text-slate-400">Step 1: Choose Crust Base</span>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(pricing.bases).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBase(b)}
                        className={`p-4 rounded-2xl text-xs font-bold transition-all border text-left flex justify-between items-center ${
                          base === b 
                            ? 'border-brand bg-brand/5 text-brand dark:bg-brand/10' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{b}</span>
                        <span className="text-[10px] opacity-75">{pricing.bases[b] > 0 ? `+₹${pricing.bases[b]}` : 'Free'}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Sauce */}
              {activeStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <span className="text-xs font-black uppercase text-slate-400">Step 2: Choose Pizza Sauce</span>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(pricing.sauces).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSauce(s)}
                        className={`p-4 rounded-2xl text-xs font-bold transition-all border text-left flex justify-between items-center ${
                          sauce === s 
                            ? 'border-brand bg-brand/5 text-brand dark:bg-brand/10' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{s}</span>
                        <span className="text-[10px] opacity-75">{pricing.sauces[s] > 0 ? `+₹${pricing.sauces[s]}` : 'Free'}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Cheese */}
              {activeStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <span className="text-xs font-black uppercase text-slate-400">Step 3: Choose Cheese Type</span>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(pricing.cheeses).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCheese(c)}
                        className={`p-4 rounded-2xl text-xs font-bold transition-all border text-left flex justify-between items-center ${
                          cheese === c 
                            ? 'border-brand bg-brand/5 text-brand dark:bg-brand/10' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{c}</span>
                        <span className="text-[10px] opacity-75">{pricing.cheeses[c] > 0 ? `+₹${pricing.cheeses[c]}` : 'Free'}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Vegetables */}
              {activeStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <span className="text-xs font-black uppercase text-slate-400">Step 4: Select Veggies (+₹{pricing.veggies} each)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['Onion', 'Capsicum', 'Corn', 'Olives', 'Mushroom', 'Paneer', 'Tomato', 'Jalapeno'].map((v) => {
                      const isSelected = veggies.includes(v);
                      return (
                        <button
                          key={v}
                          onClick={() => handleVeggieToggle(v)}
                          className={`p-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                            isSelected 
                              ? 'border-brand bg-brand/5 text-brand dark:bg-brand/10' 
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Meat Toppings */}
              {activeStep === 5 && (
                <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <span className="text-xs font-black uppercase text-slate-400">Step 5: Select Extra Toppings (+₹{pricing.toppings} each)</span>
                  <div className="grid grid-cols-2 gap-3">
                    {['Chicken', 'Pepperoni', 'Bacon', 'Sausage'].map((t) => {
                      const isSelected = toppings.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => handleToppingToggle(t)}
                          className={`p-4 rounded-2xl text-xs font-bold transition-all border text-center ${
                            isSelected 
                              ? 'border-brand bg-brand/5 text-brand dark:bg-brand/10' 
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Stepper Controls & Prices */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Calculated Cost</span>
              <span className="text-3xl font-black text-brand">₹{currentPrice}</span>
            </div>

            <div className="flex space-x-3">
              {activeStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-1.5 px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <FiChevronLeft />
                  <span>Back</span>
                </button>
              )}

              {activeStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-6 py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-colors"
                >
                  <span>Next</span>
                  <FiChevronRight />
                </button>
              ) : (
                <button
                  onClick={handleAddCustomToCart}
                  className="flex items-center space-x-2 bg-gradient-to-r from-brand to-brand-orange text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
                >
                  <FiShoppingCart />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BuildPizza;
