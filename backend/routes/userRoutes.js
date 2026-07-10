import express from 'express';
import {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  getAllUsers
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.post('/wishlist', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

// Admin-only route
router.get('/', protect, adminOnly, getAllUsers);

export default router;
