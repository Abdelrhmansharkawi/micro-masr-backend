// controllers/paymentMethodController.js
const PaymentMethod = require('../models/paymentMethodModel');

// Get all saved payment methods for logged-in user
exports.getMyPaymentMethods = async (req, res) => {
	try {
		const methods = await PaymentMethod.find({ user: req.user._id }).sort(
			'-isDefault',
		);
		res.status(200).json({ status: 'success', data: methods });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// Add a new card
exports.addCard = async (req, res) => {
	try {
		const {
			cardNumber,
			expiryMonth,
			expiryYear,
			cardHolderName,
			cardBrand,
			isDefault,
		} = req.body;
		// Validate – in production use Stripe.js to get token, never store full PAN
		const last4 = cardNumber.slice(-4);
		const method = await PaymentMethod.create({
			user: req.user._id,
			type: 'card',
			cardNumberLast4: last4,
			cardBrand,
			expiryMonth,
			expiryYear,
			cardHolderName,
			isDefault: isDefault || false,
		});
		res.status(201).json({ status: 'success', data: method });
	} catch (err) {
		res.status(400).json({ status: 'fail', message: err.message });
	}
};

// Add Vodafone Cash or Fawry
exports.addWallet = async (req, res) => {
	try {
		const { type, phoneNumber, isDefault } = req.body;
		if (!['fawry', 'vodafone'].includes(type)) {
			return res
				.status(400)
				.json({ status: 'fail', message: 'Invalid wallet type' });
		}
		const method = await PaymentMethod.create({
			user: req.user._id,
			type,
			phoneNumber,
			isDefault: isDefault || false,
		});
		res.status(201).json({ status: 'success', data: method });
	} catch (err) {
		res.status(400).json({ status: 'fail', message: err.message });
	}
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res) => {
	try {
		await PaymentMethod.findOneAndDelete({
			_id: req.params.id,
			user: req.user._id,
		});
		res.status(204).json({ status: 'success', data: null });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// Set default method
exports.setDefault = async (req, res) => {
	try {
		await PaymentMethod.updateMany(
			{ user: req.user._id },
			{ isDefault: false },
		);
		await PaymentMethod.findByIdAndUpdate(req.params.id, { isDefault: true });
		res.status(200).json({ status: 'success', message: 'Default updated' });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
