const { BettingPlan, User, Tag, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.search = async (req, res) => {
  try {
    const { q, type, league, page = 1, limit = 20 } = req.query;
    
    if (!q && !type && !league) {
      return res.status(400).json({ success: false, message: '请输入搜索内容' });
    }

    const where = { status: 'published' };
    const include = [{
      model: User,
      as: 'author',
      attributes: ['id', 'username', 'avatar', 'level']
    }];

    if (type) {
      include.push({
        model: Tag,
        where: { name: type },
        required: true,
        through: { attributes: [] }
      });
    }

    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { content: { [Op.like]: `%${q}%` } },
        { analysis: { [Op.like]: `%${q}%` } }
      ];
    }

    if (league) {
      where.league = { [Op.like]: `%${league}%` };
    }

    const results = await BettingPlan.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['publishedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: results.count,
        plans: results.rows,
        keyword: q,
        type,
        league
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.suggest = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const plans = await BettingPlan.findAll({
      where: {
        status: 'published',
        title: { [Op.like]: `%${q}%` }
      },
      attributes: ['id', 'title'],
      limit: 5
    });

    res.json({
      success: true,
      data: plans.map(p => ({ id: p.id, text: p.title, type: 'plan' }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.hotSearch = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const hotPlans = await BettingPlan.findAll({
      where: { status: 'published' },
      order: [['viewCount', 'DESC'], ['unlockCount', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'title', 'viewCount', 'unlockCount']
    });

    res.json({
      success: true,
      data: hotPlans.map(p => ({ id: p.id, text: p.title, hot: p.viewCount }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
