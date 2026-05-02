const BettingPlan = require('../models/BettingPlan');
const User = require('../models/User');
const PointsLog = require('../models/PointsLog');
const UserUnlockedPlan = require('../models/UserUnlockedPlan');
const { Op } = require('sequelize');

// 获取方案列表 - 公开
exports.getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 20, lotteryType, status = 'published' } = req.query;
    
    const where = { status };
    if (lotteryType) where.lotteryType = lotteryType;

    const { count, rows } = await BettingPlan.findAndCountAll({
      where,
      include: [{
        as: 'author',
        attributes: ['id', 'username', 'avatar', 'level']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['publishedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: count,
        plans: rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取方案详情 - 公开
exports.getPlanDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const plan = await BettingPlan.findByPk(id, {
      include: [{
        as: 'author',
        attributes: ['id', 'username', 'avatar', 'level']
      }]
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: '方案不存在' });
    }

    await plan.increment('viewCount');

    let isUnlocked = false;
    if (userId) {
      if (plan.userId === userId) {
        isUnlocked = true;
      } else {
        const unlocked = await UserUnlockedPlan.findOne({ where: { userId, planId: id } });
        isUnlocked = !!unlocked;
      }
    }

    res.json({
      success: true,
      data: {
        ...plan.toJSON(),
        isUnlocked
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 解锁方案 - 需要登录
exports.unlockPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const existing = await UserUnlockedPlan.findOne({ where: { userId, planId: id } });
    if (existing) {
      return res.status(400).json({ success: false, message: '已解锁过该方案' });
    }
    
    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: '方案不存在' });
    }
    
    if (plan.userId === userId) {
      return res.status(400).json({ success: false, message: '自己的方案无需解锁' });
    }
    
    const user = await User.findByPk(userId);
    if (user.points < plan.unlockPoints) {
      return res.status(400).json({ success: false, message: '积分不足' });
    }
    
    await user.decrement('points', { by: plan.unlockPoints });
    await UserUnlockedPlan.addUnlock(userId, id, plan.unlockPoints);
    await plan.increment('unlockCount');
    
    await PointsLog.create({
      userId,
      points: -plan.unlockPoints,
      type: 'unlock',
      relatedId: id,
      description: `解锁方案：${plan.title}`
    });
    
    res.json({ success: true, message: '解锁成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 发布方案 - 仅限管理员
exports.createPlan = async (req, res) => {
  try {
    // 仅管理员可发布
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '仅管理员可发布方案' });
    }

    const { title, content, analysis, lotteryType, league, homeTeam, awayTeam, 
            matchTime, unlockPoints, tags, userId } = req.body;
    
    // 管理员可以指定作者 ID（用于 AI 生成时标记为特定用户）
    const authorId = userId || req.user.id;
    
    const plan = await BettingPlan.create({
      userId: authorId,
      title,
      content,
      analysis,
      lotteryType,
      league,
      homeTeam,
      awayTeam,
      matchTime: matchTime ? new Date(matchTime) : null,
      unlockPoints: unlockPoints || 10,
      status: 'published'
    });

    if (tags && tags.length > 0) {
      const Tag = require('../models/Tag');
      const tagRecords = await Tag.findAll({
        where: { name: { [Op.in]: tags } }
      });
      await plan.addTags(tagRecords);
    }

    res.json({
      success: true,
      data: plan,
      message: '发布成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 修改方案 - 仅限管理员或作者
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, analysis, unlockPoints } = req.body;
    
    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: '方案不存在' });
    }

    // 仅管理员或作者可修改
    if (plan.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }

    await plan.update({ title, content, analysis, unlockPoints });
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 删除方案 - 仅限管理员
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '仅管理员可删除方案' });
    }
    
    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: '方案不存在' });
    }

    await plan.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 我的方案 - 需要登录
exports.myPlans = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const plans = await BettingPlan.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: plans.count,
        plans: plans.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
