const express = require('express');
const { getMapsConfig } = require('../controllers/configController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/maps', getMapsConfig);

module.exports = router;
