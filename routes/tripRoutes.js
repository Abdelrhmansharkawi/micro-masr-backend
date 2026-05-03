const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get(
	'/available',
	authMiddleware.protect,
	tripController.getAvailableTrips,
);
router.get('/nearby', authMiddleware.protect, tripController.getNearbyTrips);
router.get('/:id', authMiddleware.protect, tripController.getTripById);
router.get('/:id/seats', authMiddleware.protect, tripController.getTripSeats);
router.get(
	'/:id/track',
	authMiddleware.protect,
	trackingController.getTrackingInfo,
);

module.exports = router;
