const { BettingPlan, LotteryType, User, PlanUnlockRecord, Like, Collection, Comment } = require('../models');
const PointsService = require('../utils/pointsService');
const ConfigService = require('../utils/configService');
const response = require('../utils/response');
const { Op } = require('sequelize');

exports.createPlan = async (req, res) => {
  try {
    const { lotteryTypeId, title, summary, content, matchInfo, prediction, odds, confidence, planType, pricePoints } = req.body;

    const plan = await BettingPlan.create({
      userId: req.user.id,
      lotteryTypeId,
      title,
      summary,
      content,
      matchInfo,
      prediction,
      odds,
      confidence,
      planType: planType || 'single',
      pricePoints: pricePoints || await ConfigService.get('default_plan_points', 50),
      status: await ConfigService.get('require_review', true) ? 'reviewing' : 'published',
      publishedAt: new Date()
    });

    response.success(res, { plan }, '方案创建成功', 201);
  } catch (error) {
    console.error('创建方案错误:', error);
    response.error(res, '创建失败：' + error.message, 500);
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await BettingPlan.findByPk(id);

    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    if (plan.userId !== req.user.id && req.user.role !== 'admin') {
      return response.error(res, '无权限修改', 403);
    }

    const { lotteryTypeId, title, summary, content, matchInfo, prediction, odds, confidence, planType, pricePoints } = req.body;

    await plan.update({
      lotteryTypeId: lotteryTypeId || plan.lotteryTypeId,
      title: title || plan.title,
      summary: summary !== undefined ? summary : plan.summary,
      content: content || plan.content,
      matchInfo: matchInfo !== undefined ? matchInfo : plan.matchInfo,
      prediction: prediction !== undefined ? prediction : plan.prediction,
      odds: odds || plan.odds,
      confidence: confidence || plan.confidence,
      planType: planType || plan.planType,
      pricePoints: pricePoints || plan.pricePoints
    });

    response.success(res, { plan }, '方案更新成功');
  } catch (error) {
    console.error('更新方案错误:', error);
    response.error(res, '更新失败', 500);
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await BettingPlan.findByPk(id);

    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    if (plan.userId !== req.user.id && req.user.role !== 'admin') {
      return response.error(res, '无权限删除', 403);
    }

    if (req.user.role === 'admin') {
      await plan.update({ status: 'hidden' });
    } else {
      await plan.destroy();
    }

    response.success(res, null, '删除成功');
  } catch (error) {
    console.error('删除方案错误:', error);
    response.error(res, '删除失败', 500);
  }
};

exports.getPlans = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      lotteryTypeId, 
      status = 'published',
      sortBy = 'publishedAt',
      sortOrder = 'DESC',
      search 
    } = req.query;

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (lotteryTypeId) {
      where.lotteryTypeId = lotteryTypeId;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } }
      ];
    }

    const order = [[sortBy, sortOrder]];

    const { count, rows } = await BettingPlan.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: LotteryType,
          as: 'lotteryType',
          attributes: ['id', 'name', 'code', 'icon']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    response.success(res, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      plans: rows
    });
  } catch (error) {
    console.error('获取方案列表错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await BettingPlan.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'nickname', 'avatar', 'bio']
        },
        {
          model: LotteryType,
          as: 'lotteryType',
          attributes: ['id', 'name', 'code', 'icon']
        }
      ]
    });

    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    await BettingPlan.increment('viewCount', { where: { id } });

    const isUnlocked = req.user ? await PlanUnlockRecord.findOne({
      where: {
        userId: req.user.id,
        planId: id
      }
    }) : false;

    const isLiked = req.user ? await Like.findOne({
      where: {
        userId: req.user.id,
        planId: id
      }
    }) : false;

    const isCollected = req.user ? await Collection.findOne({
      where: {
        userId: req.user.id,
        planId: id
      }
    }) : false;

    const isFollowing = req.user ? await require('../models').Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: plan.userId
      }
    }) : false;

    response.success(res, {
      plan: {
        ...plan.toJSON(),
        content: (isUnlocked || req.user?.id === plan.userId || req.user?.role === 'admin') 
          ? plan.content 
          : null,
        isUnlocked: !!isUnlocked,
        isLiked: !!isLiked,
        isCollected: !!isCollected,
        isFollowing: !!isFollowing
      }
    });
  } catch (error) {
    console.error('获取方案详情错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.unlockPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    const existingUnlock = await PlanUnlockRecord.findOne({
      where: {
        userId,
        planId: id
      }
    });

    if (existingUnlock) {
      return response.success(res, { alreadyUnlocked: true }, '已解锁过该方案');
    }

    const pointsCost = plan.pricePoints;
    const hasBalance = await PointsService.checkBalance(userId, pointsCost);

    if (!hasBalance) {
      return response.error(res, `积分不足，需要${pointsCost}积分`, 400);
    }

    const transaction = await PointsService.recordTransaction(
      userId,
      'spend',
      'plan_unlock',
      pointsCost,
      `解锁方案：${plan.title}`,
      id,
      'plan',
      req.ip
    );

    await PlanUnlockRecord.create({
      userId,
      planId: id,
      authorId: plan.userId,
      pointsCost,
      ipAddress: req.ip
    });

    await BettingPlan.increment('unlockCount', { where: { id } });

    if (plan.userId !== userId) {
      const likeRewardPoints = await ConfigService.get('like_reward_points', 2);
      const authorReward = Math.floor(pointsCost * 0.3);

      await PointsService.recordTransaction(
        plan.userId,
        'earn',
        'plan_unlock',
        authorReward,
        `方案被解锁：${plan.title}`,
        id,
        'plan',
        req.ip
      );
    }

    response.success(res, {
      pointsCost,
      newBalance: transaction.newBalance,
      authorReward: plan.userId !== userId ? Math.floor(pointsCost * 0.3) : 0
    }, '解锁成功');
  } catch (error) {
    console.error('解锁方案错误:', error);
    response.error(res, '解锁失败：' + error.message, 500);
  }
};

exports.likePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    const existingLike = await Like.findOne({
      where: { userId, planId: id }
    });

    if (existingLike) {
      await existingLike.destroy();
      await BettingPlan.decrement('likeCount', { where: { id } });
      response.success(res, { liked: false }, '已取消点赞');
    } else {
      await Like.create({ userId, planId: id });
      await BettingPlan.increment('likeCount', { where: { id } });
      
      if (plan.userId !== userId) {
        const likeRewardPoints = await ConfigService.get('like_reward_points', 2);
        await PointsService.recordTransaction(
          plan.userId,
          'earn',
          'like_reward',
          likeRewardPoints,
          '方案获得点赞',
          id,
          'plan',
          req.ip
        );
      }
      
      response.success(res, { liked: true }, '点赞成功');
    }
  } catch (error) {
    console.error('点赞错误:', error);
    response.error(res, '操作失败', 500);
  }
};

exports.collectPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await BettingPlan.findByPk(id);
    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    const existingCollection = await Collection.findOne({
      where: { userId, planId: id }
    });

    if (existingCollection) {
      await existingCollection.destroy();
      await BettingPlan.decrement('collectCount', { where: { id } });
      response.success(res, { collected: false }, '已取消收藏');
    } else {
      await Collection.create({ userId, planId: id });
      await BettingPlan.increment('collectCount', { where: { id } });
      response.success(res, { collected: true }, '收藏成功');
    }
  } catch (error) {
    console.error('收藏错误:', error);
    response.error(res, '操作失败', 500);
  }
};

exports.getRanking = async (req, res) => {
  try {
    const { type = 'hitRate', period = 'all' } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    const where = { status: 'published' };
    
    if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      where.publishedAt = { [Op.gte]: oneWeekAgo };
    } else if (period === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      where.publishedAt = { [Op.gte]: oneMonthAgo };
    }

    let order;
    switch (type) {
      case 'hitRate':
        order = [['hitRate', 'DESC']];
        break;
      case 'views':
        order = [['viewCount', 'DESC']];
        break;
      case 'unlocks':
        order = [['unlockCount', 'DESC']];
        break;
      case 'likes':
        order = [['likeCount', 'DESC']];
        break;
      case 'latest':
      default:
        order = [['publishedAt', 'DESC']];
    }

    const plans = await BettingPlan.findAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: LotteryType,
          as: 'lotteryType',
          attributes: ['id', 'name', 'code']
        }
      ],
      order,
      limit
    });

    response.success(res, { plans });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.searchPlans = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;

    if (!keyword) {
      return response.error(res, '请输入搜索关键词', 400);
    }

    const { count, rows } = await BettingPlan.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { summary: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: LotteryType,
          as: 'lotteryType',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    response.success(res, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      plans: rows
    });
  } catch (error) {
    console.error('搜索方案错误:', error);
    response.error(res, '搜索失败', 500);
  }
};
