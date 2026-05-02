const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  followerId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'follower_id'
  },
  followingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'following_id'
  }
}, {
  tableName: 'follows',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['follower_id', 'following_id'] },
    { fields: ['follower_id'] },
    { fields: ['following_id'] }
  ]
});

module.exports = Follow;
