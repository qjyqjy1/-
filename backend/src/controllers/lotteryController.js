const LotteryMatch = require('../models/LotteryMatch');
const LotteryResult = require('../models/LotteryResult');
const LotteryConfig = require('../models/LotteryConfig');
const { Op } = require('sequelize');

// 获取彩种列表
exports.getConfigs = async (req, res) => {
  try {
    const configs = await LotteryConfig.getAll();
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取今日竞彩赛程
exports.getTodayMatches = async (req, res) => {
  try {
    const { type } = req.query;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const where = { matchTime: { [Op.between]: [start, end] } };
    if (type) where.lotteryType = type;

    const matches = await LotteryMatch.findAll({
      where,
      order: [['matchTime', 'ASC']]
    });

    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取昨日开奖结果
exports.getYesterdayResults = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const results = await LotteryResult.findAll({
      where: { drawDate: { [Op.gte]: yesterday } },
      order: [['lotteryType', 'ASC'], ['drawDate', 'DESC']]
    });

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取历史开奖记录
exports.getHistory = async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    if (!type) {
      return res.status(400).json({ success: false, message: '缺少彩种参数' });
    }

    const results = await LotteryResult.findAll({
      where: { lotteryType: type },
      order: [['drawDate', 'DESC'], ['issueNumber', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取最新开奖（所有彩种）
exports.getLatestResults = async (req, res) => {
  try {
    const types = ['ssq', 'dlt', '3d', 'p5', 'qlc'];
    const results = [];
    
    for (const type of types) {
      const result = await LotteryResult.findOne({
        where: { lotteryType: type },
        order: [['drawDate', 'DESC']]
      });
      if (result) results.push(result);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取单个彩种详情
exports.getLotteryDetail = async (req, res) => {
  try {
    const { type } = req.params;
    
    const [latest, history, configs] = await Promise.all([
      LotteryResult.findOne({
        where: { lotteryType: type },
        order: [['drawDate', 'DESC']]
      }),
      LotteryResult.findAll({
        where: { lotteryType: type },
        order: [['drawDate', 'DESC']],
        limit: 30
      }),
      LotteryConfig.findOne({ where: { lotteryType: type } })
    ]);

    res.json({
      success: true,
      data: {
        config: configs,
        latest,
        history
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 管理员：添加/更新赛程
exports.updateMatch = async (req, res) => {
  try {
    const { matchId, lotteryType, league, homeTeam, awayTeam, matchTime, 
            homeScore, awayScore, oddsWin, oddsDraw, oddsLoss, isHot } = req.body;

    const [match, created] = await LotteryMatch.findOrCreate({
      where: { matchId },
      defaults: {
        matchId,
        lotteryType,
        league,
        homeTeam,
        awayTeam,
        matchTime,
        homeScore,
        awayScore,
        oddsWin,
        oddsDraw,
        oddsLoss,
        isHot
      }
    });

    if (!created) {
      await match.update({
        league, homeTeam, awayTeam, matchTime, homeScore, awayScore,
        oddsWin, oddsDraw, oddsLoss, isHot
      });
    }

    res.json({ success: true, data: match, created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 管理员：添加开奖结果
exports.addResult = async (req, res) => {
  try {
    const { lotteryType, issueNumber, drawDate, winningNumbers, 
            specialNumber, prizePool, prizeInfo, nextIssue, nextPool } = req.body;

    const [result, created] = await LotteryResult.findOrCreate({
      where: { lotteryType, issueNumber },
      defaults: {
        lotteryType,
        issueNumber,
        drawDate,
        winningNumbers,
        specialNumber,
        prizePool,
        prizeInfo,
        nextIssue,
        nextPool
      }
    });

    if (!created) {
      await result.update({
        drawDate,
        winningNumbers,
        specialNumber,
        prizePool,
        prizeInfo,
        nextIssue,
        nextPool
      });
    }

    res.json({ success: true, data: result, created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
