const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require login
router.use(authMiddleware.protect);

router.get('/unread-count', notificationController.getUnreadCount);
router.get('/', notificationController.getMyNotifications);
router.patch('/read', notificationController.markAllAsRead);

module.exports = router;
