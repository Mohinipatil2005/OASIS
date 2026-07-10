import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null means Admin/Broadcast notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'order', 'inventory', 'payment'], default: 'info' },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
