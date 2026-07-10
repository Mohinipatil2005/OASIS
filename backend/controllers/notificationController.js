import Notification from '../models/Notification.js';

/**
 * Get notifications for the logged-in user or admin
 */
export const getNotifications = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      // Admins see broadcast/low stock inventory logs (user is null) and their specific ones
      query = { $or: [{ user: req.user._id }, { user: null }] };
    } else {
      // Standard users only see their private notifications
      query = { user: req.user._id };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a specific notification as read
 */
export const markAsRead = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Verify ownership (unless it's an admin broadcast notification)
    if (notification.user && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user/admin notifications as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = { $or: [{ user: req.user._id }, { user: null }], isRead: false };
    } else {
      query = { user: req.user._id, isRead: false };
    }

    await Notification.updateMany(query, { isRead: true });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
