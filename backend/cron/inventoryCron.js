import cron from 'node-cron';
import Inventory from '../models/Inventory.js';
import Admin from '../models/Admin.js';
import Notification from '../models/Notification.js';
import { sendLowStockAlertEmail } from '../services/emailService.js';
import { emitToAdmins } from '../socket/socketHandler.js';

export const checkLowStock = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });

    if (lowStockItems.length > 0) {
      console.log(`[Cron Audit] Found ${lowStockItems.length} low-stock ingredients.`);

      // Get all Admin accounts or fallback to a default email
      const admins = await Admin.find({});
      const adminEmails = admins.length > 0 ? admins.map(a => a.email) : [process.env.EMAIL_FROM || 'admin@pizzadelivery.com'];

      // Send email alert to admins
      for (const email of adminEmails) {
        await sendLowStockAlertEmail(email, lowStockItems);
      }

      // Create a persistent notification for the administrative dashboard
      const notificationMessage = `The following ingredients are low: ${lowStockItems.map(item => `${item.name} (${item.quantity} remaining)`).join(', ')}`;
      const notification = await Notification.create({
        user: null, // Broadcast to admins
        title: '⚠️ Low Stock Warning',
        message: notificationMessage,
        type: 'inventory'
      });

      // Push real-time notification to active admin clients over Socket.io
      emitToAdmins('new_notification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt
      });
    } else {
      console.log('[Cron Audit] All ingredients have normal stock levels.');
    }
  } catch (error) {
    console.error('Error executing low-stock audit cron:', error.message);
  }
};

export const startInventoryCron = () => {
  // Run once every hour: '0 * * * *'
  // For validation and testing, we can also run every hour or a custom testing schedule
  cron.schedule('0 * * * *', () => {
    console.log('[Cron] Executing hourly low-stock check...');
    checkLowStock();
  });
  console.log('Cron Job scheduled: Hourly low-stock checker active.');
};
