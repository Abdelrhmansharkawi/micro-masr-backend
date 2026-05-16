const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', reviewController.createReview);

module.exports = router;
