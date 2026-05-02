const { PointsLedger } = require('../models');
const { User } = require('../models');
const { Op } = require('sequelize');

class PointsService {
  static async recordTransaction(userId, type, category, amount, description, referenceId = null, referenceType = null, ipAddress = null) {
    const transaction = await PointsLedger.sequelize.transaction();
    
    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error('用户不存在');
      }

      const newBalance = type === 'earn' 
        ? user.points + amount 
        : user.points - amount;

      if (newBalance < 0) {
        throw new Error('积分不足');
      }

      user.points = newBalance;
      
      if (type === 'earn') {
        user.totalPointsEarned = user.totalPointsEarned + amount;
      } else {
        user.totalPointsSpent = user.totalPointsSpent + Math.abs(amount);
      }

      await user.save({ transaction });

      const record = await PointsLedger.create({
        userId,
        type,
        category,
        amount: type === 'earn' ? amount : -amount,
        balanceAfter: newBalance,
        description,
        referenceId,
        referenceType,
        ipAddress
      }, { transaction });

      await transaction.commit();

      return {
        record,
        newBalance
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getLedger(userId, page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    const where = { userId };

    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    }

    const { count, rows } = await PointsLedger.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }]
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      records: rows
    };
  }

  static async checkBalance(userId, requiredPoints) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user.points >= requiredPoints;
  }
}

module.exports = PointsService;
