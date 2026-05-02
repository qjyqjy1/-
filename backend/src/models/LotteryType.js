const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const LotteryType = sequelize.define('LotteryType', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING(100)
  },
  description: {
    type: DataTypes.STRING(255)
  },
  sortOrder: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'sort_order'
  },
  isActive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'is_active'
  }
}, {
  tableName: 'lottery_types',
  timestamps: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['sort_order'] }
  ]
});

module.exports = LotteryType;
