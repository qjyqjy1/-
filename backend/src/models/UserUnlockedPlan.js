const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserUnlockedPlan = sequelize.define('UserUnlockedPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  planId: { type: DataTypes.INTEGER, allowNull: false, field: 'plan_id' },
  unlockPoints: { type: DataTypes.INTEGER, allowNull: false, field: 'unlock_points' },
  unlockedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'unlocked_at' },
  isWinner: { type: DataTypes.BOOLEAN, defaultValue: null, field: 'is_winner' },
  prizeAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, field: 'prize_amount' },
  checkedAt: { type: DataTypes.DATE, field: 'checked_at' }
}, {
  tableName: 'user_unlocked_plans',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id', 'plan_id'] },
    { fields: ['user_id'] },
    { fields: ['plan_id'] }
  ]
});

UserUnlockedPlan.getUserPlans = async (userId) => {
  return await UserUnlockedPlan.findAll({
    where: { userId },
    order: [['unlockedAt', 'DESC']]
  });
};

UserUnlockedPlan.addUnlock = async (userId, planId, points) => {
  const [record] = await UserUnlockedPlan.findOrCreate({
    where: { userId, planId },
    defaults: {
      userId,
      planId,
      unlockPoints: points
    }
  });
  return record;
};

module.exports = UserUnlockedPlan;
