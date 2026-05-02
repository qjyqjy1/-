const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const BettingPlan = sequelize.define('BettingPlan', {
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
  lotteryTypeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'lottery_type_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING(500)
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  matchInfo: {
    type: DataTypes.JSON,
    field: 'match_info'
  },
  prediction: {
    type: DataTypes.STRING(255)
  },
  odds: {
    type: DataTypes.DECIMAL(10, 2)
  },
  confidence: {
    type: DataTypes.INTEGER.UNSIGNED
  },
  planType: {
    type: DataTypes.ENUM('single', 'combine', 'system'),
    defaultValue: 'single',
    field: 'plan_type'
  },
  pricePoints: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 50,
    field: 'price_points'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'reviewing', 'rejected', 'hidden'),
    defaultValue: 'reviewing'
  },
  viewCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'view_count'
  },
  unlockCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'unlock_count'
  },
  likeCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'like_count'
  },
  collectCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'collect_count'
  },
  commentCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'comment_count'
  },
  hitRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'hit_rate'
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    field: 'review_notes'
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  }
}, {
  tableName: 'betting_plans',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['lottery_type_id'] },
    { fields: ['status'] },
    { fields: ['published_at'] }
  ]
});

module.exports = BettingPlan;
