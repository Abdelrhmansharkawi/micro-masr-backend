const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		reason: String,
		refundedAt: {
			type: Date,
			default: Date.now,
		},
		refundTransactionId: String,
	},
	{ _id: false },
);

const paymentSchema = new mongoose.Schema(
	{
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Booking',
			required: true,
		},

		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		trip: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Trip',
			required: true,
		},

		amount: {
			type: Number,
			required: true,
		},

		currency: {
			type: String,
			default: 'EGP',
		},

		paymentMethod: {
			type: String,
			enum: ['card', 'wallet', 'cash'],
			required: true,
		},

		provider: {
			type: String,
			enum: ['stripe', 'fawry', 'paymob', 'manual', null],
			default: null,
		},

		transactionId: {
			type: String,
		},

		status: {
			type: String,
			enum: [
				'pending',
				'authorized',
				'paid',
				'failed',
				'cancelled',
				'refunded',
				'partially_refunded',
			],
			default: 'pending',
		},

		paidAt: Date,

		refunds: [refundSchema],

		metadata: {
			type: Map,
			of: String,
		},
	},
	{ timestamps: true },
);

// Prevent duplicate payment per booking
paymentSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
