// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route (user must be logged in)
router.post(
	'/payments/initiate-paymob',
	authMiddleware.protect,
	paymentController.initiatePaymobPayment,
);

// Public webhook (Paymob calls this, no auth required)
router.post('/webhooks/paymob', paymentController.paymobWebhook);

// User redirection page (Paymob webview client-side GET)
router.get('/webhooks/paymob', paymentController.paymobCallbackRedirect);

// Optional status check
router.get(
	'/payments/status/:bookingId',
	authMiddleware.protect,
	paymentController.checkPaymentStatus,
);

module.exports = router;
