import express from 'express';
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// User & Admin shared endpoints
router.post('/', createOrder);
router.post('/verify', verifyPayment);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

// Admin-only endpoints
router.get('/admin/list', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.get('/admin/stats', adminOnly, getDashboardStats);

export default router;
