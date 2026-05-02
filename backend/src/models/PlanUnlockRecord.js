const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const PlanUnlockRecord = sequelize.define('PlanUnlockRecord', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id'
  },
  planId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'plan_id'
  },
  authorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'author_id'
  },
  pointsCost: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'points_cost'
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    field: 'unlocked_at'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    field: 'ip_address'
  }
}, {
  tableName: 'plan_unlock_records',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id', 'plan_id'] },
    { fields: ['user_id', 'unlocked_at'] },
    { fields: ['plan_id'] },
    { fields: ['author_id'] }
  ]
});

module.exports = PlanUnlockRecord;
