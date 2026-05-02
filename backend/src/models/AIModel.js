const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// AIModel - 用于记录 AI 调用历史
const AIModel = sequelize.define('AIModel', {
  id: {
    type: DataTypes.STRING(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  messages: {
    type: DataTypes.JSON,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usage: {
    type: DataTypes.JSON,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'success'
  }
}, {
  tableName: 'ai_calls',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['provider'] },
    { fields: ['user_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AIModel;
