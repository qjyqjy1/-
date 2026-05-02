const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// 所有 AI 相关接口仅限管理员
router.get('/providers', auth, admin, aiController.getProviders);
router.post('/providers/:key', auth, admin, aiController.saveProvider);
router.post('/providers/:key/models', auth, admin, aiController.addModel);
router.get('/providers/:key/test', auth, admin, aiController.testProvider);
router.post('/chat', auth, admin, aiController.chat);

module.exports = router;
