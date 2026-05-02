const Membership = require('../models/v3/Membership');
const MembershipOrder = require('../models/v3/MembershipOrder');
const MembershipConfig = require('../models/v3/MembershipConfig');
const User = require('../models/User');
const { Op } = require('sequelize');

// 获取会员配置
exports.getConfigs = async (req, res) => {
  try {
    const configs = await MembershipConfig.findAll({ order: [['level', 'ASC']] });
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 获取我的会员状态
exports.getMyMembership = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await Membership.getUserMembership(userId);
    
    if (!membership) {
      return res.json({ success: true, data: { level: 1, name: '普通会员', benefits: {} } });
    }

    const isExpired = membership.endDate && new Date(membership.endDate) < new Date();
    const config = await MembershipConfig.findOne({ where: { level: membership.level } });

    res.json({
      success: true,
      data: {
        ...membership.toJSON(),
        isExpired,
        config: config ? config.toJSON() : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 创建会员订单
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, durationDays, paymentMethod } = req.body;

    const config = await MembershipConfig.findOne({ where: { level } });
    if (!config) {
      return res.status(404).json({ success: false, message: '会员等级不存在' });
    }

    const pricePerMonth = parseFloat(config.priceMonthly);
    const months = durationDays / 30;
    const actualAmount = pricePerMonth * months;

    const orderNo = `M${Date.now()}${userId}`;
    
    const order = await MembershipOrder.create({
      userId,
      orderNo,
      level,
      durationDays,
      originalPrice: pricePerMonth,
      actualAmount,
      paymentMethod: paymentMethod || 'wechat',
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        orderNo: order.orderNo,
        amount: actualAmount,
        level: config.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 回调：支付成功
exports.handlePayment = async (req, res) => {
  try {
    const { orderNo } = req.body;
    
    const order = await MembershipOrder.findOne({ where: { orderNo } });
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.json({ success: true, message: '订单已处理' });
    }

    // 更新订单状态
    await order.update({ status: 'paid', paidAt: new Date() });

    // 创建或更新会员
    const [membership, created] = await Membership.findOrCreate({
      where: { userId: order.userId },
      defaults: {
        userId: order.userId,
        level: order.level,
        startDate: new Date(),
        endDate: new Date(Date.now() + order.durationDays * 24 * 60 * 60 * 1000)
      }
    });

    if (!created) {
      // 已有会员，累加时长
      const newEndDate = new Date(membership.endDate || new Date());
      newEndDate.setDate(newEndDate.getDate() + order.durationDays);
      await membership.update({
        level: order.level,
        endDate: newEndDate
      });
    }

    // 发送 WebSocket 通知
    const websocket = require('../websocket/server');
    await websocket.sendNotification(
      order.userId,
      'membership_activated',
      '会员开通成功',
      `恭喜您成为${level === 3 ? 'SVIP' : level === 2 ? 'VIP' : '会员'}！`
    );

    res.json({ success: true, message: '会员开通成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 会员列表（管理员）
exports.getMemberships = async (req, res) => {
  try {
    const { page = 1, limit = 20, level } = req.query;
    const where = {};
    if (level) where.level = level;

    const result = await Membership.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'username', 'phone'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { total: result.count, memberships: result.rows }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
