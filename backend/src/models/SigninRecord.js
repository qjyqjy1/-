const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const SigninRecord = sequelize.define('SigninRecord', {
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
  signinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'signin_date'
  },
  pointsEarned: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 20,
    field: 'points_earned'
  }
}, {
  tableName: 'signin_records',
  indexes: [
    { fields: ['signin_date'] },
    { unique: true, fields: ['user_id', 'signin_date'] }
  ]
});

module.exports = SigninRecord;
