const Payment = require('../models/PaymentModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const PaymentMethod = require('../models/paymentMethodModel'); // <-- imported

exports.simulatePayment = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const { paymentMethodId } = req.body;

		// 1. Validate booking
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({
				status: 'fail',
				message: 'Booking not found',
			});
		}
		if (booking.paymentStatus === 'paid') {
			return res.status(400).json({
				status: 'fail',
				message: 'Already paid',
			});
		}

		// 2. Validate payment method belongs to the logged user
		const paymentMethod = await PaymentMethod.findOne({
			_id: paymentMethodId,
			user: req.user._id,
		});
		if (!paymentMethod) {
			return res.status(400).json({
				status: 'fail',
				message: 'Invalid or unauthorized payment method',
			});
		}

		// 3. Determine provider and real payment method type
		let paymentMethodType = 'wallet'; // default
		let provider = 'manual';

		if (paymentMethod.type === 'card') {
			paymentMethodType = 'card';
			provider = 'stripe';
		} else if (paymentMethod.type === 'vodafone') {
			paymentMethodType = 'wallet';
			provider = 'vodafone_cash';
		} else if (paymentMethod.type === 'fawry') {
			paymentMethodType = 'wallet';
			provider = 'fawry';
		}

		// 4. Create payment record (simulated success)
		const payment = await Payment.create({
			booking: booking._id,
			user: booking.user,
			trip: booking.trip,
			amount: booking.totalPrice,
			paymentMethod: paymentMethodType,
			provider: provider,
			transactionId: 'SIM-' + Date.now(),
			status: 'paid',
			paidAt: new Date(),
			metadata: new Map(
				Object.entries({
					paymentMethodId: paymentMethod._id.toString(),
					cardLast4: paymentMethod.cardNumberLast4 || '',
				}),
			),
		});

		// 5. Update booking payment status
		booking.paymentStatus = 'paid';
		await booking.save();

		// 6. Populate references for response
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
		res.status(500).json({
			status: 'error',
			message: err.message,
		});
	}
};
