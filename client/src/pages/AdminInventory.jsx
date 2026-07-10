import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiDatabase, FiPlus, FiTrash2, FiEdit2, FiAlertTriangle, FiX } from 'react-icons/fi';

export const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Add / Edit states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', quantity: '', unit: 'grams', lowStockThreshold: '100'
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory', {
        params: { page, limit: 12, search }
      });
      if (res.data.success) {
        setInventory(res.data.inventory);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load inventory stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, search]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const { name, quantity, unit, lowStockThreshold } = formData;
    if (!name || quantity === '' || !unit || lowStockThreshold === '') {
      toast.error('All fields are required.');
      return;
    }

    try {
      if (editItem) {
        // Edit item
        const res = await api.put(`/inventory/${editItem._id}`, formData);
        if (res.data.success) {
          toast.success(res.data.message);
          setInventory(prev => prev.map(item => item._id === editItem._id ? res.data.item : item));
        }
      } else {
        // Create item
        const res = await api.post('/inventory', formData);
        if (res.data.success) {
          toast.success(res.data.message);
          setInventory(prev => [res.data.item, ...prev]);
        }
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ingredient stock');
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient? This will break associated pizza recipes.')) return;
    try {
      const res = await api.delete(`/inventory/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setInventory(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete inventory ingredient');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditItem(null);
    setFormData({ name: '', quantity: '', unit: 'grams', lowStockThreshold: '100' });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
            <FiDatabase className="text-brand" />
            <span>Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-sans mt-0.5">Control ingredient stocks and warning triggers</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          {/* Search bar */}
          <input 
            type="text" 
            placeholder="Search stock..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border text-xs w-full sm:max-w-xs focus:outline-none"
          />
          {/* Add trigger */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 bg-brand hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider shrink-0"
          >
            <FiPlus />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Grid inventory listing */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <span className="text-4xl select-none">🌾</span>
          <h3 className="text-sm font-bold mt-2">No Ingredients Registered</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {inventory.map((item) => {
            const isLowStock = item.quantity <= item.lowStockThreshold;

            return (
              <div 
                key={item._id}
                className={`p-5 rounded-3xl glass border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isLowStock 
                    ? 'border-brand/40 bg-brand/5 dark:bg-brand/10' 
                    : 'border-slate-200/50 dark:border-slate-850'
                }`}
              >
                
                {/* Info */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate">{item.name}</h3>
                    {isLowStock && (
                      <span className="text-brand animate-pulse" title="Critical low stock level detected">
                        <FiAlertTriangle />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-sans">
                    Threshold: {item.lowStockThreshold} {item.unit}
                  </span>
                </div>

                {/* Stock levels & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className={`text-base font-black ${isLowStock ? 'text-brand' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.quantity} <span className="text-xs font-semibold opacity-70">{item.unit}</span>
                  </span>
                  
                  <div className="flex space-x-1.5">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand"
                      title="Adjust quantity"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-450 hover:text-brand"
                      title="Delete ingredient"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-md w-full glass p-6 rounded-3xl border shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {editItem ? '✏️ Restock Ingredient' : '➕ Add Ingredient'}
              </span>
              <button onClick={handleCloseModal} className="p-1 focus:outline-none"><FiX /></button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ingredient Name</label>
                <input 
                  type="text" placeholder="Mozzarella / Mushrooms" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!!editItem} // Name cannot be changed if editing to preserve recipes
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Stock Quantity</label>
                  <input 
                    type="number" placeholder="500" value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Measurement Unit</label>
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                  >
                    <option value="grams">grams</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>

              {/* Low Stock Warning Threshold */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Low Stock Warning Threshold</label>
                <input 
                  type="number" placeholder="100" value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-brand text-white font-extrabold py-3 rounded-xl hover:bg-brand-dark transition-colors uppercase tracking-wider text-xs"
              >
                {editItem ? 'Save Adjustments' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInventory;
