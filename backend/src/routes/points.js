const express = require('express');
const router = express.Router();

const pointsController = require('../controllers/pointsController');
const auth = require('../middleware/auth').auth;

router.get('/', auth, pointsController.getStatistics);
router.get('/ledger', auth, pointsController.getLedger);

module.exports = router;
