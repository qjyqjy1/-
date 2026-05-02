const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const tagsController = require('../controllers/tagsController');

router.get('/', tagsController.getTags);
router.post('/', auth, admin, tagsController.createTag);
router.get('/:tagName/plans', tagsController.getPlansByTag);

module.exports = router;
