// routes/savedPlaceRoutes.js
const express = require('express');
const router = express.Router();
const savedPlaceController = require('../controllers/savedPlaceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-places', savedPlaceController.getMyPlaces);
router.post('/', savedPlaceController.addPlace);
router.delete('/:id', savedPlaceController.deletePlace);

module.exports = router;
