const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { getMyUnlocked, getMyPrizes, checkPrizes } = require('../controllers/userUnlockedController');

router.get('/my-unlocked', auth, getMyUnlocked);
router.get('/my-prizes', auth, getMyPrizes);
router.post('/check-prizes', auth, admin, checkPrizes);

module.exports = router;
