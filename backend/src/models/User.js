const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: '/default-avatar.png'
  },
  nickname: {
    type: DataTypes.STRING(50)
  },
  bio: {
    type: DataTypes.TEXT
  },
  points: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 100
  },
  totalPointsEarned: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 100,
    field: 'total_points_earned'
  },
  totalPointsSpent: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'total_points_spent'
  },
  lastSigninDate: {
    type: DataTypes.DATEONLY,
    field: 'last_signin_date'
  },
  consecutiveSigninDays: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'consecutive_signin_days'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'banned', 'pending'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
