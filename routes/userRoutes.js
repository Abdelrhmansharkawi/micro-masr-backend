const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/notification-settings', userController.getNotificationSettings);
router.patch(
	'/notification-settings',
	userController.updateNotificationSettings,
);

module.exports = router;
