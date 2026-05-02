const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const commentsController = require('../controllers/commentsController');

router.get('/plan/:planId', commentsController.getComments);
router.post('/', auth, commentsController.addComment);
router.delete('/:id', auth, commentsController.deleteComment);
router.post('/:id/like', auth, commentsController.likeComment);

module.exports = router;
