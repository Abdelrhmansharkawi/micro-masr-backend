const Payment = require('../models/PaymentModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.simulatePayment = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const { paymentMethod } = req.body;

		if (!['card', 'wallet', 'cash'].includes(paymentMethod)) {
			return res.status(400).json({
				status: 'fail',
				message: 'Invalid payment method',
			});
		}

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Booking not found' });
		}

		if (booking.paymentStatus === 'paid') {
			return res.status(400).json({ status: 'fail', message: 'Already paid' });
		}

		const payment = await Payment.create({
			booking: booking._id,
			user: booking.user,
			trip: booking.trip,
			amount: booking.totalPrice,
			paymentMethod,
			provider: 'manual',
			transactionId: 'SIM-' + Date.now(),
			status: 'paid',
			paidAt: new Date(),
		});

		booking.paymentStatus = 'paid';
		await booking.save();

		await booking.populate('trip');
		await booking.populate('user', 'fullName');

		res.status(200).json({
			status: 'success',
			data: {
				payment,
				booking,
			},
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
