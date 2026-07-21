import mongoose from 'mongoose';

const PizzaIngredientSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantityRequired: { type: Number, required: true } // amount to subtract from stock on order
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PizzaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isCustomizable: { type: Boolean, default: false },
  ingredients: [PizzaIngredientSchema],
  reviews: [ReviewSchema],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isAvailable: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Pizza = mongoose.model('Pizza', PizzaSchema);
export default Pizza;
