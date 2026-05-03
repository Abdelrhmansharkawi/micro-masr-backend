const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect);
router.post('/', bookingController.createBooking);
router.post('/:bookingId/pay', paymentController.simulatePayment);

module.exports = router;
