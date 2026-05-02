const express = require('express');
const router = express.Router();

const signinController = require('../controllers/signinController');
const auth = require('../middleware/auth').auth;

router.post('/', auth, signinController.doSignin);
router.get('/status', auth, signinController.getSigninStatus);
router.get('/records', auth, signinController.getSigninRecords);

module.exports = router;
