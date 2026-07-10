import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  size: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },
  isCustomized: { type: Boolean, default: false },
  customizationDetails: {
    base: { type: String },
    sauce: { type: String },
    cheese: { type: String },
    veggies: [{ type: String }],
    toppings: [{ type: String }]
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  status: {
    type: String,
    enum: ['received', 'preparing', 'kitchen', 'delivery', 'delivered'],
    default: 'received'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
