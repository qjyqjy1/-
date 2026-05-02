// 评论系统已禁用
const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(503).json({ 
    success: false, 
    message: '评论系统已禁用' 
  });
});

module.exports = router;
