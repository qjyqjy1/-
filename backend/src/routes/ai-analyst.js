const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiAnalystController = require('../controllers/aiAnalystController');

router.post('/analyze', auth, aiAnalystController.analyze);
router.post('/chat', auth, aiAnalystController.chat);
router.get('/history', auth, aiAnalystController.history);

module.exports = router;
