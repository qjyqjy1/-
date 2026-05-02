const { Favorite, Like, BettingPlan, User } = require('../models');

exports.toggleFavorite = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const existing = await Favorite.findOne({ where: { userId, planId } });
    
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, favorited: false, message: '已取消收藏' });
    }

    await Favorite.create({ userId, planId });
    res.json({ success: true, favorited: true, message: '收藏成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const favorites = await Favorite.findAndCountAll({
      where: { userId },
      include: [{
        model: BettingPlan,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total: favorites.count,
        plans: favorites.rows.map(f => f.BettingPlan)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const existing = await Like.findOne({ where: { userId, planId } });
    
    if (existing) {
      await existing.destroy();
      await BettingPlan.decrement('likeCount', { where: { id: planId } });
      return res.json({ success: true, liked: false, message: '已取消点赞' });
    }

    await Like.create({ userId, planId });
    await BettingPlan.increment('likeCount', { where: { id: planId } });
    
    res.json({ success: true, liked: true, message: '点赞成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlanStats = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user?.id;

    const plan = await BettingPlan.findByPk(planId, {
      attributes: ['id', 'viewCount', 'unlockCount', 'likeCount', 'favoriteCount']
    });

    let userAction = { favorited: false, liked: false };
    if (userId) {
      const fav = await Favorite.findOne({ where: { userId, planId } });
      const like = await Like.findOne({ where: { userId, planId } });
      userAction = { favorited: !!fav, liked: !!like };
    }

    res.json({
      success: true,
      data: { ...plan.toJSON(), ...userAction }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
