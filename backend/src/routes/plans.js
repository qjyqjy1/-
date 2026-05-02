const express = require('express');
const router = express.Router();

const planController = require('../controllers/planController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, planController.getPlans);
router.get('/search', planController.searchPlans);
router.get('/ranking', planController.getRanking);
router.get('/:id', optionalAuth, planController.getPlanById);

router.post('/', auth, planController.createPlan);
router.put('/:id', auth, planController.updatePlan);
router.delete('/:id', auth, planController.deletePlan);

router.post('/:id/unlock', auth, planController.unlockPlan);
router.post('/:id/like', auth, planController.likePlan);
router.post('/:id/collect', auth, planController.collectPlan);

module.exports = router;
