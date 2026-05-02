const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/:id', optionalAuth, userController.getUserProfile);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/followings', userController.getFollowings);
router.post('/:id/follow', auth, userController.follow);

module.exports = router;
