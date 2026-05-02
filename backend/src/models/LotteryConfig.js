const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LotteryConfig = sequelize.define('LotteryConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lotteryType: { type: DataTypes.STRING, unique: true, allowNull: false, field: 'lottery_type' },
  lotteryName: { type: DataTypes.STRING, allowNull: false, field: 'lottery_name' },
  drawDays: { type: DataTypes.STRING, field: 'draw_days' },
  drawTime: { type: DataTypes.TIME, defaultValue: '21:00:00', field: 'draw_time' },
  price: { type: DataTypes.DECIMAL(5, 2), defaultValue: 2.00 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
  icon: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING, defaultValue: '#dc3545' }
}, {
  tableName: 'lottery_configs',
  timestamps: false
});

LotteryConfig.getAll = async () => {
  return await LotteryConfig.findAll({
    where: { isActive: true },
    order: [['sort_order', 'ASC']]
  });
};

module.exports = LotteryConfig;
