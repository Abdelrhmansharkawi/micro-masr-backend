const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			default: '',
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String,
			enum: ['trip_update', 'payment', 'system', 'promo'],
			default: 'system',
		},
	},
	{ timestamps: true },
);

// Index for fast queries by user & read status
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
