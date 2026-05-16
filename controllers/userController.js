const User = require('../models/userModel');

exports.getNotificationSettings = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select(
			'notificationSettings',
		);
		res.status(200).json({
			status: 'success',
			data: user.notificationSettings,
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};


exports.updateNotificationSettings = async (req, res) => {
	try {
		const allowedFields = [
			'bookingUpdates',
			'microbusArrival',
			'tripRating',
			'newCoupons',
			'systemNews',
			'pushEnabled',
			'smsEnabled',
			'emailEnabled',
		];
		const updates = {};
		Object.keys(req.body).forEach((key) => {
			if (allowedFields.includes(key) && typeof req.body[key] === 'boolean') {
				updates[`notificationSettings.${key}`] = req.body[key];
			}
		});

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: updates },
			{ new: true, runValidators: true },
		).select('notificationSettings');

		res.status(200).json({
			status: 'success',
			data: user.notificationSettings,
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
