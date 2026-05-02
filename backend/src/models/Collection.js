const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Collection = sequelize.define('Collection', {
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
  }
}, {
  tableName: 'collections',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id', 'plan_id'] },
    { fields: ['user_id'] },
    { fields: ['plan_id'] }
  ]
});

module.exports = Collection;
