const { Tag, BettingPlan } = require('../models');

exports.getTags = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;

    const tags = await Tag.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'DESC']]
    });

    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, type, color } = req.body;
    const [tag] = await Tag.findOrCreate({
      where: { name },
      defaults: { type: type || 'sport', color: color || '#007bff' }
    });
    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlansByTag = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const tag = await Tag.findOne({ where: { name: tagName } });
    if (!tag) {
      return res.status(404).json({ success: false, message: '标签不存在' });
    }

    const result = await BettingPlan.findAndCountAll({
      where: { status: 'published' },
      include: [{
        model: Tag,
        where: { id: tag.id },
        through: { attributes: [] }
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['publishedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { total: result.count, plans: result.rows }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
