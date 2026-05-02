const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/', searchController.search);
router.get('/suggest', searchController.suggest);
router.get('/hot', searchController.hotSearch);

module.exports = router;
