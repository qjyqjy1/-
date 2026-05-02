const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Like = sequelize.define('Like', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  planId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'plan_id' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'created_at' }
}, {
  tableName: 'likes',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id', 'plan_id'] }
  ]
});

module.exports = Like;
