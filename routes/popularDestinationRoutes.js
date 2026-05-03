// routes/popularDestinationRoutes.js
const express = require('express');
const router = express.Router();
const popularController = require('../controllers/popularDestinationController');

router.get('/', popularController.getPopularDestinations);

module.exports = router;
