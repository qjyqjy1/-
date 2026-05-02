const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Op = require('sequelize').Op;

const LotteryResult = sequelize.define('LotteryResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lotteryType: { type: DataTypes.STRING, allowNull: false, field: 'lottery_type' },
  issueNumber: { type: DataTypes.STRING, allowNull: false, field: 'issue_number' },
  drawDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'draw_date' },
  drawTime: { type: DataTypes.TIME, defaultValue: '21:00:00', field: 'draw_time' },
  winningNumbers: { type: DataTypes.STRING, allowNull: false, field: 'winning_numbers' },
  specialNumber: { type: DataTypes.STRING, field: 'special_number' },
  prizePool: { type: DataTypes.DECIMAL(15, 2), field: 'prize_pool' },
  salesAmount: { type: DataTypes.DECIMAL(15, 2), field: 'sales_amount' },
  prizeInfo: { type: DataTypes.JSON, field: 'prize_info' },
  nextIssue: { type: DataTypes.STRING, field: 'next_issue' },
  nextPool: { type: DataTypes.DECIMAL(15, 2), field: 'next_pool' },
  dataSource: { type: DataTypes.STRING, defaultValue: 'manual', field: 'data_source' }
}, {
  tableName: 'lottery_results',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['lottery_type', 'issue_number'] },
    { fields: ['lottery_type', 'draw_date'] }
  ]
});

// 获取昨日开奖
LotteryResult.getYesterdayResult = async (type) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  return await LotteryResult.findAll({
    where: {
      lotteryType: type,
      drawDate: { [Op.gte]: yesterday }
    },
    order: [['drawDate', 'DESC']],
    limit: 1
  });
};

// 获取历史开奖
LotteryResult.getHistory = async (type, limit = 50) => {
  return await LotteryResult.findAll({
    where: { lotteryType: type },
    order: [['drawDate', 'DESC'], ['issueNumber', 'DESC']],
    limit
  });
};

// 获取最新开奖
LotteryResult.getLatest = async (types) => {
  const results = [];
  for (const type of types) {
    const result = await LotteryResult.findOne({
      where: { lotteryType: type },
      order: [['drawDate', 'DESC']]
    });
    if (result) results.push(result);
  }
  return results;
};

module.exports = LotteryResult;
