const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');
const handleValidationErrors = require('../middleware/validation');

const validationRules = [
  body('username')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度 3-20 位')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  body('password')
    .isLength({ min: 6 }).withMessage('密码至少 6 位'),
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确')
];

router.post('/register', validationRules, handleValidationErrors, authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
