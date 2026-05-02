const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const AdViewRecord = sequelize.define('AdViewRecord', {
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
  adId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'ad_id'
  },
  pointsReward: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'points_reward'
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    field: 'viewed_at'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.STRING(255),
    field: 'user_agent'
  }
}, {
  tableName: 'ad_view_records',
  timestamps: false,
  indexes: [
    { fields: ['user_id', 'viewed_at'] },
    { fields: ['ad_id', 'viewed_at'] }
  ]
});

module.exports = AdViewRecord;
