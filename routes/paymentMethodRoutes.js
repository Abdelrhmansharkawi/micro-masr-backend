// routes/paymentMethodRoutes.js
const express = require('express');
const paymentMethodController = require('../controllers/paymentMethodController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/', paymentMethodController.getMyPaymentMethods);
router.post('/card', paymentMethodController.addCard);
router.post('/wallet', paymentMethodController.addWallet);
router.delete('/:id', paymentMethodController.deletePaymentMethod);
router.patch('/:id/default', paymentMethodController.setDefault);

module.exports = router;
