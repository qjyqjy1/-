const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const favoritesController = require('../controllers/favoritesController');

router.post('/toggle', auth, favoritesController.toggleFavorite);
router.get('/my', auth, favoritesController.getFavorites);
router.post('/like/toggle', auth, favoritesController.toggleLike);
router.get('/plan/:planId/stats', favoritesController.getPlanStats);

module.exports = router;
