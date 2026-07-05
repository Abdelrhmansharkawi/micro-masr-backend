// controllers/paymentController.js
const Booking = require('../models/bookingModel');
const Payment = require('../models/PaymentModel');
const paymobService = require('../services/paymobService');

// ========================================================
// 1. INITIATE PAYMOB PAYMENT (Called from Flutter App)
// ========================================================
exports.initiatePaymobPayment = async (req, res) => {
	try {
		const { bookingId, integrationId } = req.body;

		// Validate booking
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Booking not found' });
		}
		if (booking.paymentStatus === 'paid') {
			return res.status(400).json({ status: 'fail', message: 'Already paid' });
		}

		// Get user data from request
		const userData = {
			firstName: req.user.fullName?.split(' ')[0] || 'User',
			lastName: req.user.fullName?.split(' ').slice(1).join(' ') || '',
			email: req.user.email,
			phone: req.user.phone,
		};

		// Initiate Paymob payment
		const result = await paymobService.initiatePayment(
			booking.totalPrice,
			integrationId,
			req.user._id,
			userData,
		);

		// Save payment initiation reference in booking
		booking.paymentToken = result.paymentToken;
		booking.paymobOrderId = result.orderId;
		await booking.save();

		res.status(200).json({
			status: 'success',
			data: {
				paymentToken: result.paymentToken,
				orderId: result.orderId,
				integrationId: result.integrationId,
				iframeId: process.env.PAYMOB_IFRAME_ID,
			},
		});
	} catch (err) {
		console.error('Initiate payment error:', err);
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// ========================================================
// 2. PAYMOB WEBHOOK (Called by Paymob when payment is done)
// ========================================================
exports.paymobWebhook = async (req, res) => {
	console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));
	try {
		const { type, obj } = req.body;

		// ✅ Handle case-insensitive type check
		if (type?.toLowerCase() === 'transaction' && obj?.success === true) {
			const orderId = obj.order?.id;
			const amountCents = obj.amount_cents;
			const transactionId = obj.id;
			const paymentMethodType =
				obj.source_data?.type === 'card' ? 'card' : 'wallet'; // 👈 detect method

			if (!orderId) {
				console.error('Order ID missing in webhook');
				return res
					.status(400)
					.json({ status: 'fail', message: 'Order ID missing' });
			}

			// Find booking by paymobOrderId
			const booking = await Booking.findOne({ paymobOrderId: orderId });
			if (!booking) {
				console.error('Booking not found for order:', orderId);
				return res
					.status(404)
					.json({ status: 'fail', message: 'Booking not found' });
			}

			// Prevent double processing
			if (booking.paymentStatus === 'paid') {
				return res
					.status(200)
					.json({ status: 'success', message: 'Already processed' });
			}

			// Verify amount
			const expectedAmount = Math.round(booking.totalPrice * 100);
			if (amountCents !== expectedAmount) {
				console.error('Amount mismatch:', amountCents, expectedAmount);
				return res
					.status(400)
					.json({ status: 'fail', message: 'Amount mismatch' });
			}

			// Record payment
			const payment = await Payment.create({
				booking: booking._id,
				user: booking.user,
				trip: booking.trip,
				amount: booking.totalPrice,
				paymentMethod: paymentMethodType, // 👈 now dynamic
				provider: 'paymob',
				transactionId: transactionId,
				status: 'paid',
				paidAt: new Date(),
				metadata: {
					paymobOrderId: orderId,
					transactionId: transactionId,
					sourceType: obj.source_data?.type || 'unknown',
					integrationId: obj.integration_id?.toString() || '',
				},
			});

			booking.paymentStatus = 'paid';
			await booking.save();

			console.log(
				'✅ Payment recorded successfully:',
				payment._id,
				'method:',
				paymentMethodType,
			);
			res.status(200).json({ status: 'success' });
		} else {
			console.log('Webhook event ignored (not a successful transaction)');
			res.status(200).json({ status: 'received' });
		}
	} catch (err) {
		console.error('Webhook error:', err);
		res.status(500).json({ status: 'error', message: err.message });
	}
};

// ========================================================
// 2b. PAYMOB REDIRECT LANDING (Called in webview after payment)
// ========================================================
exports.paymobCallbackRedirect = async (req, res) => {
	try {
		// Paymob passes success status as a query parameter string
		const isSuccess = req.query.success === 'true';

		if (isSuccess) {
			res.send(`
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: sans-serif; text-align: center; padding: 40px; background-color: #F2EFE8; }
                            h1 { color: #4CAF50; }
                            p { color: #333; font-size: 16px; }
                        </style>
                    </head>
                    <body>
                        <h1>تمت عملية الدفع بنجاح! 🎉</h1>
                        <p>يمكنك الآن إغلاق هذه الصفحة والعودة للتطبيق.</p>
                    </body>
                </html>
            `);
		} else {
			res.send(`
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: sans-serif; text-align: center; padding: 40px; background-color: #F2EFE8; }
                            h1 { color: #F44336; }
                            p { color: #333; font-size: 16px; }
                        </style>
                    </head>
                    <body>
                        <h1>فشلت عملية الدفع ❌</h1>
                        <p>يرجى إغلاق الصفحة والمحاولة مرة أخرى.</p>
                    </body>
                </html>
            `);
		}
	} catch (err) {
		console.error('Redirect error:', err);
		res.status(500).send('Something went wrong');
	}
};

// ========================================================
// 3.CHECK PAYMENT STATUS
// ========================================================
exports.checkPaymentStatus = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res
				.status(404)
				.json({ status: 'fail', message: 'Booking not found' });
		}
		res.status(200).json({
			status: 'success',
			data: { paymentStatus: booking.paymentStatus },
		});
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
};
