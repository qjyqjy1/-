const { Comment, User, BettingPlan } = require('../models');
const { filterContent } = require('../middleware/sensitiveFilter');

exports.getComments = async (req, res) => {
  try {
    const { planId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.findAndCountAll({
      where: { planId, parentId: null, status: 'active' },
      include: [
        { model: User, attributes: ['id', 'username', 'avatar'] },
        { 
          model: Comment, 
          as: 'replies',
          include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { total: comments.count, comments: comments.rows }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { planId, content, parentId } = req.body;
    const userId = req.user.id;

    const filtered = filterContent(content);
    if (filtered.hasSensitive) {
      return res.status(400).json({
        success: false,
        message: '内容包含敏感词：' + filtered.sensitiveWords.join(', ')
      });
    }

    const comment = await Comment.create({
      userId,
      planId,
      parentId: parentId || null,
      content: filtered.filtered
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });

    res.json({ success: true, data: fullComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: '评论不存在' });
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限' });
    }

    await comment.update({ status: 'deleted' });
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.increment('likeCount', { where: { id } });
    res.json({ success: true, message: '点赞成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
