const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  planId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'plan_id' },
  parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'parent_id' },
  content: { type: DataTypes.TEXT, allowNull: false },
  likeCount: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: 'like_count' },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['plan_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = Comment;
