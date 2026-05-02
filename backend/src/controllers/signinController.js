const { User, SigninRecord } = require('../models');
const PointsService = require('../utils/pointsService');
const ConfigService = require('../utils/configService');
const response = require('../utils/response');

exports.doSignin = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const existingSignin = await SigninRecord.findOne({
      where: {
        userId,
        signinDate: today
      }
    });

    if (existingSignin) {
      return response.error(res, '今日已签到，明天再来吧', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    const signinPoints = await ConfigService.get('signin_points', 20);
    let pointsEarned = signinPoints;

    const consecutiveDays = user.consecutiveSigninDays + 1;
    const continuousBonus = await ConfigService.get('signin_continuous_bonus', 5);

    if (consecutiveDays % 7 === 0) {
      pointsEarned += continuousBonus;
    }

    const transaction = await PointsService.recordTransaction(
      userId,
      'earn',
      'signin',
      pointsEarned,
      `每日签到奖励${consecutiveDays % 7 === 0 ? '（含连续签到 bonus）' : ''}`,
      null,
      null,
      req.ip
    );

    await SigninRecord.create({
      userId,
      signinDate: today,
      pointsEarned
    });

    user.lastSigninDate = today;
    user.consecutiveSigninDays = consecutiveDays;
    await user.save();

    response.success(res, {
      pointsEarned,
      consecutiveDays,
      newBalance: transaction.newBalance,
      isContinuousBonus: consecutiveDays % 7 === 0
    }, '签到成功');
  } catch (error) {
    console.error('签到错误:', error);
    response.error(res, '签到失败：' + error.message, 500);
  }
};

exports.getSigninStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const user = await User.findByPk(userId);

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    const hasSigninToday = user.lastSigninDate === today;

    const recentSignins = await SigninRecord.findAll({
      where: { userId },
      order: [['signinDate', 'DESC']],
      limit: 7
    });

    response.success(res, {
      hasSigninToday,
      consecutiveDays: user.consecutiveSigninDays,
      points: user.points,
      recentSignins: recentSignins.map(r => ({
        date: r.signinDate,
        points: r.pointsEarned
      }))
    });
  } catch (error) {
    console.error('获取签到状态错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.getSigninRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { count, rows } = await SigninRecord.findAndCountAll({
      where: { userId },
      order: [['signinDate', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    response.success(res, {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      records: rows
    });
  } catch (error) {
    console.error('获取签到记录错误:', error);
    response.error(res, '获取失败', 500);
  }
};
