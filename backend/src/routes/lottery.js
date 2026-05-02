const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const lotteryController = require('../controllers/lotteryController');

// 公开接口
router.get('/configs', lotteryController.getConfigs);
router.get('/matches/today', lotteryController.getTodayMatches);
router.get('/results/yesterday', lotteryController.getYesterdayResults);
router.get('/results/latest', lotteryController.getLatestResults);
router.get('/results/history', lotteryController.getHistory);
router.get('/:type/detail', lotteryController.getLotteryDetail);

// 管理员接口
router.post('/matches', auth, admin, lotteryController.updateMatch);
router.post('/results', auth, admin, lotteryController.addResult);

module.exports = router;
