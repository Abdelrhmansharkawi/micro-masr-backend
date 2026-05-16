const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.use(protect);
router.get('/me', protect, authController.getMe);
router.patch('/update-me', protect, authController.updateMe);
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;
