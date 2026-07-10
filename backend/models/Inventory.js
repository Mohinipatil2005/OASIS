import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., 'grams', 'ml', 'units'
  lowStockThreshold: { type: Number, required: true, default: 10 }
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
