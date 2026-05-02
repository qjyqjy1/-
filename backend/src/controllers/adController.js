const { Ad, AdViewRecord, User } = require('../models');
const PointsService = require('../utils/pointsService');
const ConfigService = require('../utils/configService');
const response = require('../utils/response');
const { Op } = require('sequelize');

exports.getAds = async (req, res) => {
  try {
    const { position, platform = 'all' } = req.query;
    const now = new Date();

    const where = {
      isActive: 1
    };

    if (position) {
      where.position = position;
    }

    if (platform !== 'all') {
      where[Op.or] = [
        { platform },
        { platform: 'all' }
      ];
    }

    where[Op.or] = [
      { startDate: { [Op.lte]: now }, endDate: { [Op.gte]: now } },
      { startDate: null, endDate: null },
      { startDate: { [Op.lte]: now }, endDate: null },
      { startDate: null, endDate: { [Op.gte]: now } }
    ];

    const ads = await Ad.findAll({
      where,
      order: [['priority', 'DESC']],
      attributes: ['id', 'name', 'position', 'adType', 'jsCode', 'imageUrl', 'linkUrl', 'pointsReward']
    });

    response.success(res, { ads });
  } catch (error) {
    console.error('获取广告错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.viewAd = async (req, res) => {
  try {
    const { adId } = req.body;
    const userId = req.user.id;

    const ad = await Ad.findByPk(adId);
    if (!ad) {
      return response.error(res, '广告不存在', 404);
    }

    if (!ad.isActive) {
      return response.error(res, '广告已下线', 400);
    }

    const adViewPoints = await ConfigService.get('ad_view_points', 10);
    const pointsReward = ad.pointsReward || adViewPoints;

    const recentView = await AdViewRecord.findOne({
      where: {
        userId,
        adId
      },
      order: [['viewedAt', 'DESC']]
    });

    if (recentView) {
      const timeDiff = Date.now() - new Date(recentView.viewedAt).getTime();
      if (timeDiff < 60000) {
        return response.error(res, '请勿重复观看广告', 400);
      }
    }

    await AdViewRecord.create({
      userId,
      adId,
      pointsReward,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await Ad.increment('viewCount', { where: { id: adId } });

    const transaction = await PointsService.recordTransaction(
      userId,
      'earn',
      'ad_view',
      pointsReward,
      '观看广告奖励',
      adId,
      'ad',
      req.ip
    );

    response.success(res, {
      pointsEarned: pointsReward,
      newBalance: transaction.newBalance
    }, '积分已发放');
  } catch (error) {
    console.error('观看广告错误:', error);
    response.error(res, '操作失败：' + error.message, 500);
  }
};

exports.getAdRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { count, rows } = await AdViewRecord.findAndCountAll({
      where: { userId },
      order: [['viewedAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      include: [{
        model: Ad,
        as: 'ad',
        attributes: ['id', 'name', 'position']
      }]
    });

    response.success(res, {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      records: rows
    });
  } catch (error) {
    console.error('获取广告记录错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.clickAd = async (req, res) => {
  try {
    const { adId } = req.body;
    
    await Ad.increment('clickCount', {
      where: { id: adId }
    });

    response.success(res, null, '记录成功');
  } catch (error) {
    console.error('记录广告点击错误:', error);
    response.error(res, '操作失败', 500);
  }
};
