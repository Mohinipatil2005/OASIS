import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiMapPin, FiTrash2, FiCamera, FiPlus, FiX } from 'react-icons/fi';

export const Profile = () => {
  const { user, updateProfile, addAddress, deleteAddress } = useAuth();

  // Profile Edit States
  const [name, setName] = useState(user?.name || '');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressInput, setAddressInput] = useState({
    street: '', city: '', state: '', zipCode: '', phone: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await updateProfile(formData);
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { street, city, state, zipCode, phone } = addressInput;
    if (!street || !city || !state || !zipCode || !phone) {
      toast.error('All fields are required.');
      return;
    }

    try {
      const currentAddresses = user?.addresses || [];
      const res = await addAddress({ ...addressInput, isDefault: currentAddresses.length === 0 });
      if (res.success) {
        toast.success('Address added successfully.');
        setAddressInput({ street: '', city: '', state: '', zipCode: '', phone: '' });
        setShowAddressForm(false);
      }
    } catch (err) {
      toast.error('Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await deleteAddress(id);
      if (res.success) {
        toast.success('Address deleted successfully.');
      }
    } catch (err) {
      toast.error('Failed to delete address.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen space-y-10">
      <h1 className="text-3xl font-extrabold">My Profile Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Card: Edit Avatar & Details */}
        <div className="md:col-span-1 glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            
            {/* Avatar upload */}
            <div className="flex flex-col items-center space-y-3 relative group">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-850">
                {imagePreview ? (
                  <img src={imagePreview} alt="avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-orange/20 text-brand-orange flex items-center justify-center text-3xl font-bold font-sans select-none">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-sm">
                  <FiCamera className="w-6 h-6" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">Hover to change picture</span>
            </div>

            {/* Name input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs" 
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address (Read-only)</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={user?.email} 
                  disabled
                  className="pl-9 w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-450 cursor-not-allowed" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={updatingProfile}
              className="w-full bg-brand hover:bg-brand-dark text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {updatingProfile ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Right Card: Address CRUD */}
        <div className="md:col-span-2 glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-250 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
              <FiMapPin className="text-brand" />
              <span>Saved Addresses</span>
            </h2>
            {!showAddressForm && (
              <button 
                onClick={() => setShowAddressForm(true)}
                className="flex items-center space-x-1 text-xs font-bold text-brand hover:underline"
              >
                <FiPlus />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="space-y-3 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 relative">
              <button type="button" onClick={() => setShowAddressForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-brand"><FiX /></button>
              <span className="text-xs font-bold block uppercase text-slate-400">Add New Shipping Address</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <input 
                  type="text" placeholder="Street Address" value={addressInput.street}
                  onChange={(e) => setAddressInput({...addressInput, street: e.target.value})}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                />
                <input 
                  type="text" placeholder="City" value={addressInput.city}
                  onChange={(e) => setAddressInput({...addressInput, city: e.target.value})}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                />
                <input 
                  type="text" placeholder="State" value={addressInput.state}
                  onChange={(e) => setAddressInput({...addressInput, state: e.target.value})}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                />
                <input 
                  type="text" placeholder="Zip Code" value={addressInput.zipCode}
                  onChange={(e) => setAddressInput({...addressInput, zipCode: e.target.value})}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                />
              </div>
              <input 
                type="text" placeholder="Phone Number" value={addressInput.phone}
                onChange={(e) => setAddressInput({...addressInput, phone: e.target.value})}
                className="max-w-sm w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs mt-1"
              />
              <div className="pt-2">
                <button type="submit" className="bg-brand text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-wider">Save Address</button>
              </div>
            </form>
          )}

          {/* List addresses */}
          {user?.addresses?.length === 0 ? (
            <p className="text-xs text-slate-400 font-sans italic py-4">No addresses saved yet. Use the button to register an address.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.addresses?.map((addr, idx) => (
                <div key={addr._id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-sans space-y-2 relative flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>Address #{idx + 1}</span>
                      {addr.isDefault && <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full text-[9px]">DEFAULT</span>}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 mt-2">
                    <span className="text-[10px] text-slate-400">Phone: {addr.phone || 'N/A'}</span>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-slate-450 hover:text-brand focus:outline-none p-1"
                      title="Delete Address"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
