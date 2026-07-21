import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PizzaCard from '../components/PizzaCard';
import { FiSearch, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MOCK_PIZZAS } from '../utils/mockPizzas';

export const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [pizzas, setPizzas] = useState([]);
  const [categories, setCategories] = useState(['Veg', 'Non-Veg', 'Sides', 'Beverages']);
  const [loading, setLoading] = useState(true);

  // Read URL search params for pagination/filters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'Veg';
  const sort = searchParams.get('sort') || '-createdAt';

  const [searchInput, setSearchInput] = useState(search);
  const [totalPages, setTotalPages] = useState(1);

  // categories are static ['Veg', 'Non-Veg']

  // Fetch pizzas based on parameters
  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 150,
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
        setPizzas(MOCK_PIZZAS);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [page, search, category, sort]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
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
        </>
      )}

    </div>
  );
};

export default Menu;
