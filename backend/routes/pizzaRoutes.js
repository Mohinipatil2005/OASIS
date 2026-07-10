import express from 'express';
import {
  getPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
  addPizzaReview,
  getCategories
} from '../controllers/pizzaController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', getPizzas);
router.get('/categories', getCategories);
router.get('/:id', getPizzaById);

// User protected review route
router.post('/:id/reviews', protect, addPizzaReview);

// Admin-only CRUD routes
router.post('/', protect, adminOnly, upload.single('image'), createPizza);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePizza);
router.delete('/:id', protect, adminOnly, deletePizza);

export default router;
