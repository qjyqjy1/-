const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Membership = sequelize.define('Membership', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'user_id' },
  level: { type: DataTypes.TINYINT, defaultValue: 1, comment: '1:普通 2:VIP 3:SVIP' },
  startDate: { type: DataTypes.DATE, field: 'start_date' },
  endDate: { type: DataTypes.DATE, field: 'end_date' },
  benefits: { type: DataTypes.JSON },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
}, {
  tableName: 'memberships',
  timestamps: true,
  indexes: [{ fields: ['user_id'] }, { fields: ['level'] }]
});

Membership.getUserMembership = async (userId) => {
  return await Membership.findOne({ where: { userId } });
};

Membership.isVip = async (userId) => {
  const membership = await Membership.getUserMembership(userId);
  return membership && membership.level >= 2 && (!membership.endDate || new Date(membership.endDate) > new Date());
};

module.exports = Membership;
