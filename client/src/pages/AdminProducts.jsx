import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiSliders, FiPlus, FiTrash2, FiEdit, FiCamera, FiX, FiCheck } from 'react-icons/fi';

export const AdminProducts = () => {
  const [pizzas, setPizzas] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Form Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Veg');
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVeg, setIsVeg] = useState(true);
  const [recipeIngredients, setRecipeIngredients] = useState([]); // array of { ingredient: id, quantityRequired: num }

  // Temp selected ingredient to append to recipe
  const [tempIngredientId, setTempIngredientId] = useState('');
  const [tempQuantity, setTempQuantity] = useState('');

  const fetchPizzas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pizzas', {
        params: { page, limit: 1000, search, isAvailable: 'all' }
      });
      if (res.data.success) {
        setPizzas(res.data.pizzas);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load pizza catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await api.get('/inventory', { params: { limit: 100 } });
      if (res.data.success) {
        setInventoryList(res.data.inventory);
      }
    } catch (err) {
      console.warn('Failed to load inventory for recipes');
    }
  };

  useEffect(() => {
    fetchPizzas();
    fetchInventoryItems();
  }, [page, search]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddIngredientToRecipe = () => {
    if (!tempIngredientId || !tempQuantity || isNaN(tempQuantity) || Number(tempQuantity) <= 0) {
      toast.error('Please select an ingredient and set a valid quantity.');
      return;
    }

    const matchedIng = inventoryList.find(i => i._id === tempIngredientId);
    if (!matchedIng) return;

    // Check if already exists in recipe
    if (recipeIngredients.some(item => item.ingredient === tempIngredientId)) {
      toast.error('This ingredient is already in the recipe list.');
      return;
    }

    setRecipeIngredients(prev => [
      ...prev,
      {
        ingredient: tempIngredientId,
        ingredientName: matchedIng.name,
        unit: matchedIng.unit,
        quantityRequired: Number(tempQuantity)
      }
    ]);
    setTempIngredientId('');
    setTempQuantity('');
  };

  const handleRemoveIngredientFromRecipe = (id) => {
    setRecipeIngredients(prev => prev.filter(item => item.ingredient !== id));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !category) {
      toast.error('Please complete all standard fields.');
      return;
    }

    if (!editProduct && !imageFile) {
      toast.error('An image file is required for new pizzas.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('isCustomizable', isCustomizable.toString());
    formData.append('isAvailable', isAvailable.toString());
    formData.append('isVeg', isVeg.toString());
    
    // Package recipe ingredients as stringified JSON array
    const recipePayload = recipeIngredients.map(item => ({
      ingredient: item.ingredient,
      quantityRequired: item.quantityRequired
    }));
    formData.append('ingredients', JSON.stringify(recipePayload));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    setLoading(true);
    try {
      if (editProduct) {
        // Update pizza
        const res = await api.put(`/pizzas/${editProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          toast.success(res.data.message);
          fetchPizzas();
        }
      } else {
        // Create pizza
        const res = await api.post('/pizzas', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          toast.success(res.data.message);
          fetchPizzas();
        }
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (prod) => {
    setEditProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setCategory(prod.category);
    setIsCustomizable(prod.isCustomizable);
    setIsAvailable(prod.isAvailable);
    setIsVeg(prod.isVeg !== undefined ? prod.isVeg : true);
    setImagePreview(prod.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop');

    // Map ingredients populated from db
    const mapped = prod.ingredients.map(item => ({
      ingredient: item.ingredient?._id || item.ingredient,
      ingredientName: item.ingredient?.name || 'Raw Ingredient',
      unit: item.ingredient?.unit || 'grams',
      quantityRequired: item.quantityRequired
    }));
    setRecipeIngredients(mapped);

    setShowProductModal(true);
  };

  const handleDeletePizza = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pizza?')) return;
    try {
      const res = await api.delete(`/pizzas/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setPizzas(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete pizza product');
    }
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setEditProduct(null);
    setImageFile(null);
    setImagePreview('');
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Veg');
    setIsCustomizable(true);
    setIsAvailable(true);
    setIsVeg(true);
    setRecipeIngredients([]);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
            <FiSliders className="text-brand" />
            <span>Pizza Products</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-sans mt-0.5">Manage standard gourmet menu options</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <input 
            type="text" 
            placeholder="Search pizza catalog..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border text-xs w-full sm:max-w-xs focus:outline-none"
          />
          <button 
            onClick={() => setShowProductModal(true)}
            className="flex items-center space-x-1.5 bg-brand hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider shrink-0"
          >
            <FiPlus />
            <span>Create Pizza</span>
          </button>
        </div>
      </div>

      {/* Grid listing */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {pizzas.map((pizza) => (
            <div 
              key={pizza._id}
              className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between overflow-hidden"
            >
              <div className="h-40 overflow-hidden relative">
                <img src={pizza.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop'} alt={pizza.name} className="w-full h-full object-cover" />
                <span className={`absolute bottom-2.5 left-2.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase text-white ${
                  pizza.category === 'Veg' ? 'bg-emerald-500' : 'bg-brand'
                }`}>
                  {pizza.category}
                </span>
                {!pizza.isAvailable && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold bg-slate-800 text-white px-2.5 py-0.5 rounded-full">SOLD OUT</span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate">{pizza.name}</h3>
                  <span className="font-black text-sm block">₹{pizza.price}</span>
                </div>

                <div className="flex space-x-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 justify-end">
                  <button 
                    onClick={() => handleEditClick(pizza)}
                    className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-650 hover:text-brand"
                  >
                    <FiEdit />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeletePizza(pizza._id)}
                    className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-450 hover:text-brand"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Creation / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full glass p-6 rounded-3xl border shadow-2xl space-y-5 my-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {editProduct ? '✏️ Configure Pizza details' : '🍕 Create New Pizza'}
              </span>
              <button onClick={handleCloseModal} className="p-1 focus:outline-none"><FiX /></button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-5">
              
              {/* Image upload preview */}
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-750 shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="pizza preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">No image</div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <FiCamera />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <div className="text-xs font-sans text-slate-450">
                  <p className="font-bold">Pizza Catalog Image</p>
                  <p>Choose jpeg/png file. Recommended size 600x600 px.</p>
                </div>
              </div>

              {/* Standard inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pizza Name</label>
                  <input 
                    type="text" placeholder="Gourmet Margherita" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Price (₹)</label>
                  <input 
                    type="number" placeholder="299" value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Description</label>
                <textarea 
                  rows="3" placeholder="Tangy tomato sauce layered with cheese..." value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category</label>
                  <select 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Sides">Sides</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-5 select-none">
                  <input 
                    type="checkbox" id="isCustomizable" checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <label htmlFor="isCustomizable" className="text-xs font-bold text-slate-650 cursor-pointer">Allow Customization</label>
                </div>

                <div className="flex items-center space-x-2 pt-5 select-none">
                  <input 
                    type="checkbox" id="isAvailable" checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <label htmlFor="isAvailable" className="text-xs font-bold text-slate-650 cursor-pointer">In-stock Available</label>
                </div>

                <div className="flex items-center space-x-2 pt-5 select-none">
                  <input 
                    type="checkbox" id="isVeg" checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <label htmlFor="isVeg" className="text-xs font-bold text-slate-650 cursor-pointer">Vegetarian Item</label>
                </div>
              </div>

              {/* Recipe builder section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">Configure Recipe Ingredients</span>
                
                {/* Selector */}
                <div className="flex flex-col sm:flex-row items-end gap-3 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-750">
                  <div className="w-full space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Choose Ingredient</label>
                    <select
                      value={tempIngredientId}
                      onChange={(e) => setTempIngredientId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs focus:outline-none"
                    >
                      <option value="">-- Choose Stock Item --</option>
                      {inventoryList.map(item => (
                        <option key={item._id} value={item._id}>{item.name} ({item.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full sm:max-w-[120px] space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Quantity</label>
                    <input 
                      type="number" placeholder="Quantity" value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIngredientToRecipe}
                    className="w-full sm:w-auto bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Recipe items list */}
                <div className="space-y-1.5 font-sans text-xs">
                  {recipeIngredients.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No recipe ingredient constraints mapped. Stock won't auto-deduct for this pizza.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recipeIngredients.map(item => (
                        <div key={item.ingredient} className="flex justify-between items-center p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 px-3">
                          <span>
                            {item.ingredientName} : <strong>{item.quantityRequired} {item.unit}</strong>
                          </span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveIngredientFromRecipe(item.ingredient)}
                            className="text-slate-400 hover:text-brand focus:outline-none p-1"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <button 
                type="submit" 
                className="w-full bg-brand text-white font-extrabold py-3.5 rounded-2xl hover:bg-brand-dark transition-colors uppercase tracking-widest text-xs"
              >
                {editProduct ? 'Save Changes' : 'Create Pizza'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
