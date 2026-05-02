const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { User, BettingPlan, Ad, PointsLedger, SystemConfig } = require('../models');
const response = require('../utils/response');
const { Op } = require('sequelize');

router.use(auth);
router.use(admin);

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPlans, todayViews, todayUnlocks] = await Promise.all([
      User.count(),
      BettingPlan.count(),
      BettingPlan.sum('viewCount'),
      BettingPlan.sum('unlockCount')
    ]);

    response.success(res, {
      totalUsers: totalUsers || 0,
      totalPlans: totalPlans || 0,
      todayViews: todayViews || 0,
      todayUnlocks: todayUnlocks || 0
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    response.error(res, '获取失败', 500);
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    response.success(res, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      users: rows
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    response.error(res, '获取失败', 500);
  }
});

router.put('/users/:id/points', async (req, res) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    const PointsService = require('../utils/pointsService');
    await PointsService.recordTransaction(
      parseInt(id),
      points > 0 ? 'earn' : 'spend',
      'admin_adjust',
      Math.abs(points),
      `管理员调整：${reason || '手动调整'}`,
      null,
      null,
      req.ip
    );

    response.success(res, null, '积分调整成功');
  } catch (error) {
    console.error('调整积分失败:', error);
    response.error(res, '调整失败', 500);
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    await user.update({ status });
    response.success(res, null, '状态更新成功');
  } catch (error) {
    console.error('更新状态失败:', error);
    response.error(res, '更新失败', 500);
  }
});

router.put('/plans/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    await plan.update({
      status: status === 'published' ? 'published' : 'rejected',
      reviewNotes: reviewNotes || null,
      publishedAt: status === 'published' ? new Date() : plan.publishedAt
    });

    response.success(res, null, '审核完成');
  } catch (error) {
    console.error('审核失败:', error);
    response.error(res, '审核失败', 500);
  }
});

router.get('/ads', async (req, res) => {
  try {
    const ads = await Ad.findAll({
      order: [['priority', 'DESC']]
    });
    response.success(res, { ads });
  } catch (error) {
    console.error('获取广告列表失败:', error);
    response.error(res, '获取失败', 500);
  }
});

router.post('/ads', async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    response.success(res, { ad }, '创建成功', 201);
  } catch (error) {
    console.error('创建广告失败:', error);
    response.error(res, '创建失败', 500);
  }
});

router.put('/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);
    
    if (!ad) {
      return response.error(res, '广告不存在', 404);
    }

    await ad.update(req.body);
    response.success(res, { ad }, '更新成功');
  } catch (error) {
    console.error('更新广告失败:', error);
    response.error(res, '更新失败', 500);
  }
});

router.get('/config', async (req, res) => {
  try {
    const ConfigService = require('../utils/configService');
    const config = await ConfigService.getAll();
    response.success(res, config);
  } catch (error) {
    console.error('获取配置失败:', error);
    response.error(res, '获取失败', 500);
  }
});

router.post('/config', async (req, res) => {
  try {
    const ConfigService = require('../utils/configService');
    
    for (const [key, value] of Object.entries(req.body)) {
      await ConfigService.set(key, value);
    }
    
    response.success(res, null, '配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
    response.error(res, '保存失败', 500);
  }
});

module.exports = router;
