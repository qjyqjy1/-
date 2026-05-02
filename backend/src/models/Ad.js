const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  position: {
    type: DataTypes.ENUM('header_banner', 'list_top', 'list_middle', 'list_bottom', 'detail_top', 'detail_side', 'detail_bottom', 'footer', 'points_wall'),
    allowNull: false
  },
  adType: {
    type: DataTypes.ENUM('image', 'js_code', 'html'),
    defaultValue: 'js_code',
    field: 'ad_type'
  },
  jsCode: {
    type: DataTypes.TEXT,
    field: 'js_code'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    field: 'image_url'
  },
  linkUrl: {
    type: DataTypes.STRING(255),
    field: 'link_url'
  },
  pointsReward: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 10,
    field: 'points_reward'
  },
  viewCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'view_count'
  },
  clickCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    field: 'click_count'
  },
  isActive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'is_active'
  },
  platform: {
    type: DataTypes.ENUM('pc', 'mobile', 'all'),
    defaultValue: 'all'
  },
  priority: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    field: 'end_date'
  }
}, {
  tableName: 'ads',
  indexes: [
    { fields: ['position'] },
    { fields: ['is_active'] },
    { fields: ['platform'] }
  ]
});

module.exports = Ad;
