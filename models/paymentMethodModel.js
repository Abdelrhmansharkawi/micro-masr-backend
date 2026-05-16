// models/paymentMethodModel.js
const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['card', 'fawry', 'vodafone'],
			required: true,
		},
		// For cards
		cardNumberLast4: String,
		cardBrand: String, // e.g., 'Visa', 'MasterCard', 'Meeza'
		expiryMonth: Number,
		expiryYear: Number,
		cardHolderName: String,
		// For wallet
		phoneNumber: String, // Vodafone Cash or Fawry account
		isDefault: {
			type: Boolean,
			default: false,
		},
		// Stripe/Fawry token (if using real gateway)
		providerToken: String,
	},
	{ timestamps: true },
);

// Ensure one default per user
paymentMethodSchema.pre('save', async function () {
	if (this.isDefault) {
		await this.constructor.updateMany(
			{ user: this.user, _id: { $ne: this._id } },
			{ isDefault: false },
		);
	}
});
module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
