const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const advertiserController = require('../controllers/advertiserController');

// 需要登录
router.get('/my', auth, advertiserController.getStatus);
router.post('/apply', auth, advertiserController.apply);
router.post('/campaigns', auth, advertiserController.createCampaign);
router.get('/campaigns', auth, advertiserController.getMyCampaigns);

// 管理员
router.get('/', auth, admin, advertiserController.list);
router.post('/:id/review', auth, admin, advertiserController.review);
router.get('/admin/campaigns', auth, admin, advertiserController.manageCampaigns);

module.exports = router;
