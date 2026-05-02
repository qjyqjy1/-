const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const membershipController = require('../controllers/membershipController');

// 公开接口
router.get('/configs', membershipController.getConfigs);

// 需要登录
router.get('/my', auth, membershipController.getMyMembership);
router.post('/order', auth, membershipController.createOrder);
router.post('/payment/callback', membershipController.handlePayment);

// 管理员
router.get('/', auth, admin, membershipController.getMemberships);

module.exports = router;
