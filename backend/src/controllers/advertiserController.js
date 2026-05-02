const Advertiser = require('../models/v3/Advertiser');
const AdCampaign = require('../models/v3/AdCampaign');
const Ad = require('../models/Ad');
const User = require('../models/User');

// 成为广告主
exports.apply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyName, licenseNo, contactName, contactPhone } = req.body;

    const existing = await Advertiser.findOne({ where: { userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: '已提交申请' });
    }

    const advertiser = await Advertiser.create({
      userId,
      companyName,
      licenseNo,
      contactName,
      contactPhone,
      status: 'pending'
    });

    res.json({ success: true, data: advertiser, message: '申请已提交，等待审核' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 广告主状态
exports.getStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const advertiser = await Advertiser.findOne({ where: { userId } });
    
    res.json({
      success: true,
      data: advertiser || null,
      isAdvertiser: advertiser && advertiser.status === 'approved'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 创建广告活动
exports.createCampaign = async (req, res) => {
  try {
    const userId = req.user.id;
    const advertiser = await Advertiser.findOne({ where: { userId, status: 'approved' } });
    
    if (!advertiser) {
      return res.status(403).json({ success: false, message: '不是认证广告主' });
    }

    const { name, budget, startDate, endDate, targeting } = req.body;

    if (advertiser.balance < budget) {
      return res.status(400).json({ success: false, message: '余额不足' });
    }

    const campaign = await AdCampaign.create({
      advertiserId: advertiser.id,
      name,
      budget,
      startDate,
      endDate,
      targeting: targeting || {},
      status: 'pending'
    });

    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 我的广告活动
exports.getMyCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const advertiser = await Advertiser.findOne({ where: { userId } });
    
    if (!advertiser) {
      return res.json({ success: true, data: [] });
    }

    const campaigns = await AdCampaign.findAll({
      where: { advertiserId: advertiser.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 广告主列表（管理员）
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;

    const result = await Advertiser.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['username', 'phone'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { total: result.count, advertisers: result.rows }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 审核广告主（管理员）
exports.review = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const advertiser = await Advertiser.findByPk(id);
    if (!advertiser) {
      return res.status(404).json({ success: false, message: '广告主不存在' });
    }

    await advertiser.update({
      status,
      verifiedAt: status === 'approved' ? new Date() : null
    });

    res.json({ success: true, message: '审核完成' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 广告活动管理
exports.manageCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, advertiserId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (advertiserId) where.advertiserId = advertiserId;

    const result = await AdCampaign.findAndCountAll({
      where,
      include: [{ model: Advertiser, attributes: ['companyName', 'status'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { total: result.count, campaigns: result.rows }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
