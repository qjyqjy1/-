const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const PointsLedger = sequelize.define('PointsLedger', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id'
  },
  type: {
    type: DataTypes.ENUM('earn', 'spend'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('signin', 'ad_view', 'plan_unlock', 'like_reward', 'admin_adjust', 'refund', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  balanceAfter: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'balance_after'
  },
  description: {
    type: DataTypes.STRING(255)
  },
  referenceId: {
    type: DataTypes.INTEGER.UNSIGNED,
    field: 'reference_id'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    field: 'reference_type'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    field: 'ip_address'
  }
}, {
  tableName: 'points_ledger',
  indexes: [
    { fields: ['user_id', 'created_at'] },
    { fields: ['type'] },
    { fields: ['category'] }
  ]
});

module.exports = PointsLedger;
