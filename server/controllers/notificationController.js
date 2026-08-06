import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendNotificationEmail } from '../utils/emailHelper.js';

// @desc   Get all notifications for logged-in user
// @route  GET /api/notifications
export const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(notifications);
};

// @desc   Mark notification as read
// @route  PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
};

// @desc   Mark all notifications as read
// @route  PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
};

// @desc   Get unread count
// @route  GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        read: false
    });
    res.json({ count });
};

// Helper function to create notification
export const createNotification = async (recipientId, type, title, message, projectId = null, link = null) => {
    try {
        const recipient = await User.findById(recipientId);
        if (!recipient) return;

        const notification = await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            project: projectId,
            link,
        });

        // Send email notification
        const emailSent = await sendNotificationEmail(
            recipient.email,
            recipient.name,
            title,
            message,
            link
        );

        if (emailSent) {
            notification.emailSent = true;
            await notification.save();
        }

        // Emit real-time notification via Socket.io (if available)
        // This would be handled in the socket.io setup
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};
