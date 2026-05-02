const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserLevel = sequelize.define('UserLevel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  minPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  minPlans: { type: DataTypes.INTEGER, defaultValue: 0 },
  minUnlocks: { type: DataTypes.INTEGER, defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(3,2), defaultValue: 1.0 },
  icon: { type: DataTypes.STRING, allowNull: true },
  color: { type: DataTypes.STRING, defaultValue: '#6c757d' }
}, {
  tableName: 'user_levels',
  timestamps: true
});

// 获取用户等级
UserLevel.getUserLevel = async (user) => {
  const levels = await UserLevel.findAll({ order: [['minPoints', 'DESC']] });
  for (const level of levels) {
    if (user.points >= level.minPoints) return level;
  }
  return levels[0] || null;
};

// 初始化默认等级
UserLevel.initializeDefaults = async () => {
  const count = await UserLevel.count();
  if (count > 0) return;
  
  await UserLevel.bulkCreate([
    { name: '新手', minPoints: 0, icon: '🌱', color: '#6c757d' },
    { name: '普通', minPoints: 500, icon: '📊', color: '#17a2b8' },
    { name: '进阶', minPoints: 2000, icon: '📈', color: '#28a745' },
    { name: '专家', minPoints: 5000, icon: '⭐', color: '#ffc107' },
    { name: '达人', minPoints: 10000, icon: '🏆', color: '#fd7e14' },
    { name: '大师', minPoints: 30000, icon: '👑', color: '#dc3545' }
  ]);
};

module.exports = UserLevel;
