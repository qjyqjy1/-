const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
const Ad = require('../models/Ad');
const AdClick = require('../models/AdClick');

// 签到
exports.signin = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今日是否已签到
    const existing = await PointsLog.findOne({
      where: {
        userId,
        type: 'signin',
        createdAt: { [require('sequelize').Op.gte]: today }
      }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: '今日已签到',
        points: existing.points 
      });
    }

    // 随机积分 10-50
    const points = Math.floor(Math.random() * 41) + 10;

    await User.increment('points', { by: points, where: { id: userId } });
    
    await PointsLog.create({
      userId,
      points,
      type: 'signin',
      description: '每日签到'
    });

    res.json({ 
      success: true, 
      points,
      message: `签到成功，获得 ${points} 积分` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取广告列表
exports.getAds = async (req, res) => {
  try {
    const ads = await Ad.findAll({
      where: { isActive: true },
      order: [['priority', 'DESC']]
    });

    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 观看广告获得积分
exports.watchAd = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adId } = req.body;

    if (!adId) {
      return res.status(400).json({ success: false, message: '缺少广告 ID' });
    }

    const ad = await Ad.findByPk(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: '广告不存在' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 检查今日点击次数（上限 5 次）
    const clickCount = await AdClick.count({
      where: {
        userId,
        createdAt: { 
          [require('sequelize').Op.between]: [today, tomorrow] 
        }
      }
    });

    if (clickCount >= 5) {
      return res.status(400).json({ 
        success: false, 
        message: '今日广告点击已达上限（5 次/天）',
        hasReachedLimit: true 
      });
    }

    // 记录点击
    await AdClick.create({
      adId,
      userId,
      ip: req.ip
    });

    // 奖励积分 5-10 分
    const points = Math.floor(Math.random() * 6) + 5;
    await User.increment('points', { by: points, where: { id: userId } });
    
    await PointsLog.create({
      userId,
      points,
      type: 'ad',
      relatedId: adId,
      description: `观看广告：${ad.title}`
    });

    res.json({ 
      success: true, 
      points,
      todayCount: clickCount + 1,
      message: `获得 ${points} 积分` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 积分记录
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const where = { userId };
    if (type) where.type = type;

    const logs = await PointsLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: logs.count,
        logs: logs.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 积分统计
exports.getStatistics = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'points']
    });

    const totalEarned = await PointsLog.sum('points', {
      where: {
        userId: req.user.id,
        points: { [require('sequelize').Op.gt]: 0 }
      }
    });

    const totalSpent = await PointsLog.sum('points', {
      where: {
        userId: req.user.id,
        points: { [require('sequelize').Op.lt]: 0 }
      }
    });

    res.json({
      success: true,
      data: {
        points: user?.points || 0,
        totalEarned: totalEarned || 0,
        totalSpent: Math.abs(totalSpent || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 积分流水
exports.getLedger = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const where = { userId: req.user.id };
    if (type) where.type = type;

    const logs = await PointsLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: logs.count,
        logs: logs.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getHistory = exports.getLedger;
