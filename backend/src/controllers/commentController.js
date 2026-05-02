const { Comment, BettingPlan, User } = require('../models');
const response = require('../utils/response');

exports.getComments = async (req, res) => {
  try {
    const { planId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { count, rows } = await Comment.findAndCountAll({
      where: {
        planId,
        parentId: null,
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    response.success(res, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      comments: rows
    });
  } catch (error) {
    console.error('获取评论错误:', error);
    response.error(res, '获取失败', 500);
  }
};

exports.createComment = async (req, res) => {
  try {
    const { planId } = req.params;
    const { content, parentId } = req.body;

    if (!content || content.trim() === '') {
      return response.error(res, '评论内容不能为空', 400);
    }

    const plan = await BettingPlan.findByPk(planId);
    if (!plan) {
      return response.error(res, '方案不存在', 404);
    }

    const comment = await Comment.create({
      planId,
      userId: req.user.id,
      content,
      parentId: parentId || null,
      status: 'published'
    });

    await BettingPlan.increment('commentCount', { where: { id: planId } });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }]
    });

    response.success(res, { comment: fullComment }, '评论成功', 201);
  } catch (error) {
    console.error('创建评论错误:', error);
    response.error(res, '评论失败', 500);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return response.error(res, '评论不存在', 404);
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return response.error(res, '无权限删除', 403);
    }

    const planId = comment.planId;
    
    if (req.user.role === 'admin') {
      await comment.update({ status: 'deleted' });
    } else {
      await comment.destroy();
    }

    await BettingPlan.decrement('commentCount', { where: { id: planId } });

    response.success(res, null, '删除成功');
  } catch (error) {
    console.error('删除评论错误:', error);
    response.error(res, '删除失败', 500);
  }
};
