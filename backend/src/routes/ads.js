const express = require('express');
const router = express.Router();

const adController = require('../controllers/adController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', adController.getAds);
router.post('/view', auth, adController.viewAd);
router.post('/click', adController.clickAd);
router.get('/records', auth, adController.getAdRecords);

module.exports = router;
