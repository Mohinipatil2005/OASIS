import express from 'express';
import {
  getInventory,
  getLowStockItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// All inventory routes are restricted to authenticated admins
router.use(protect);
router.use(adminOnly);

router.get('/', getInventory);
router.get('/low', getLowStockItems);
router.post('/', addInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
