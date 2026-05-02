const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const aiGenerateController = require('../controllers/aiGenerateController');

// 仅管理员可用
router.post('/generate', auth, admin, aiGenerateController.generate);
router.post('/auto-publish', auth, admin, aiGenerateController.autoPublish);

module.exports = router;
