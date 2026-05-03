const Notification = require('../models/notificationModel');

// GET unread count only (for the badge)
exports.getUnreadCount = async (req, res) => {
	try {
		const count = await Notification.countDocuments({
			user: req.user._id,
			isRead: false,
		});
		res.status(200).json({
			status: 'success',
			data: { count },
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// GET all notifications (latest first, limit to 20)
exports.getMyNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ user: req.user._id })
			.sort('-createdAt')
			.limit(20);
		res.status(200).json({
			status: 'success',
			results: notifications.length,
			data: notifications,
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// PATCH mark all as read
exports.markAllAsRead = async (req, res) => {
	try {
		await Notification.updateMany(
			{ user: req.user._id, isRead: false },
			{ isRead: true },
		);
		res.status(200).json({
			status: 'success',
			message: 'All notifications marked as read',
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
