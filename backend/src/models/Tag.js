const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tag = sequelize.define('Tag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'sport' },
  color: { type: DataTypes.STRING, defaultValue: '#007bff' },
  sort: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'tags',
  timestamps: true
});

module.exports = Tag;
