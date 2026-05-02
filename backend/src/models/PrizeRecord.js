const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PrizeRecord = sequelize.define('PrizeRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  planId: { type: DataTypes.INTEGER, allowNull: false, field: 'plan_id' },
  lotteryType: { type: DataTypes.STRING, allowNull: false, field: 'lottery_type' },
  issueNumber: { type: DataTypes.STRING, allowNull: false, field: 'issue_number' },
  planContent: { type: DataTypes.TEXT, field: 'plan_content' },
  prizeLevel: { type: DataTypes.STRING, field: 'prize_level' },
  prizeAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, field: 'prize_amount' },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
}, {
  tableName: 'prize_records',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['plan_id'] },
    { fields: ['status'] }
  ]
});

PrizeRecord.getUserPrizes = async (userId, status = 'all') => {
  const where = { userId };
  if (status !== 'all') where.status = status;
  return await PrizeRecord.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });
};

module.exports = PrizeRecord;
