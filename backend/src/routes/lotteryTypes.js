const express = require('express');
const router = express.Router();
const { LotteryType } = require('../models');

router.get('/', async (req, res) => {
  try {
    const types = await LotteryType.findAll({
      where: { isActive: 1 },
      order: [['sortOrder', 'ASC']]
    });
    res.json({ success: true, data: { types } });
  } catch (error) {
    console.error('获取彩种失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

module.exports = router;
