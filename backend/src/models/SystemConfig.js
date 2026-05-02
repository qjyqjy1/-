const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  configKey: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  configValue: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'system_configs',
  timestamps: true
});

module.exports = SystemConfig;
