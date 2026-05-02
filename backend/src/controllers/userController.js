const { User, Follow } = require('../models');
const response = require('../utils/response');

exports.follow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (userId === parseInt(id)) {
      return response.error(res, '不能关注自己', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    const existingFollow = await Follow.findOne({
      where: {
        followerId: userId,
        followingId: id
      }
    });

    if (existingFollow) {
      await existingFollow.destroy();
      response.success(res, { followed: false }, '已取消关注');
    } else {
      await Follow.create({
        followerId: userId,
        followingId: id
      });
      response.success(res, { followed: true }, '关注成功');
    }
  } catch (error) {
    console.error('关注错误:', error);
    response.error(res, '操作失败', 500);
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const { count, rows } = await Follow.findAndCountAll({
      where: { followingId: userId },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    response.success(res, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      followers: rows.map(r => r.follower)
    });
  } catch (error) {
    console.error('获取粉丝错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.getFollowings = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const { count, rows } = await Follow.findAndCountAll({
      where: { followerId: userId },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    response.success(res, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      followings: rows.map(r => r.following)
    });
  } catch (error) {
    console.error('获取关注错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    });

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    const followerCount = await Follow.count({
      where: { followingId: id }
    });

    const followingCount = await Follow.count({
      where: { followerId: id }
    });

    const isFollowing = req.user ? await Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: id
      }
    }) : false;

    response.success(res, {
      user: {
        ...user.toJSON(),
        followerCount,
        followingCount,
        isFollowing: !!isFollowing
      }
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    response.error(res, '获取失败', 500);
  }
};
