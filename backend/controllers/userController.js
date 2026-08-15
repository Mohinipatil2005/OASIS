import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Pizza from '../models/Pizza.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

/**
 * Get logged-in user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    let profile = await User.findById(req.user._id).select('-password');
    if (!profile) {
      profile = await Admin.findById(req.user._id).select('-password');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, user: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (Name & Profile Image)
 */
export const updateProfile = async (req, res, next) => {
  const { name } = req.body;
  
  try {
    let user = await User.findById(req.user._id);
    let isAdmin = false;
    if (!user) {
      user = await Admin.findById(req.user._id);
      isAdmin = true;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;

    // Handle profile image upload to Cloudinary
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'user_profiles');
      user.profileImage = uploadResult.secure_url;
    }

    await user.save();
    
    // Return updated user omitting password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        role: isAdmin ? 'admin' : user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add shipping address
 */
export const addAddress = async (req, res, next) => {
  const { street, city, state, zipCode, country, phone, isDefault } = req.body;

  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot have shipping addresses' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If setting as default, reset other addresses' default status
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // If this is the user's first address, force it as default
    const isFirstAddress = user.addresses.length === 0;

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: isFirstAddress || isDefault
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete shipping address
 */
export const deleteAddress = async (req, res, next) => {
  const { addressId } = req.params;

  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot have shipping addresses' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If we deleted the default address, make another one default
    const hasDefault = user.addresses.some(addr => addr.isDefault);
    if (!hasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Favorite/Wishlist pizza
 */
export const toggleWishlist = async (req, res, next) => {
  const { pizzaId } = req.body;

  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot have a wishlist' });
    }

    const pizza = await Pizza.findById(pizzaId);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.wishlist.indexOf(pizzaId);

    if (index >= 0) {
      // Already wishlisted, remove it
      user.wishlist.splice(index, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Removed from wishlist',
        wishlist: user.wishlist
      });
    } else {
      // Add to wishlist
      user.wishlist.push(pizzaId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Added to wishlist',
        wishlist: user.wishlist
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Wishlist details
 */
export const getWishlist = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot have a wishlist' });
    }

    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin ONLY: Get All Users (Paginated, Searchable)
 */
export const getAllUsers = async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const search = req.query.search || '';

  const skip = (page - 1) * limit;

  try {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      users
    });
  } catch (error) {
    next(error);
  }
};
