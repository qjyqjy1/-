const jwt = require('../config/jwt');
const { User } = require('../models');
const response = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { username, password, phone, email, nickname } = req.body;

    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username },
          { phone: phone || '' },
          { email: email || '' }
        ]
      }
    });

    if (existingUser) {
      return response.error(res, '用户名、手机号或邮箱已被注册', 400);
    }

    const user = await User.create({
      username,
      password,
      phone,
      email,
      nickname: nickname || username
    });

    const token = jwt.generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    response.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        email: user.email,
        points: user.points,
        role: user.role
      }
    }, '注册成功', 201);
  } catch (error) {
    console.error('注册错误:', error);
    response.error(res, '注册失败：' + error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return response.error(res, '请输入账号和密码', 400);
    }

    const user = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username: account },
          { phone: account },
          { email: account }
        ]
      }
    });

    if (!user) {
      return response.error(res, '账号不存在', 404);
    }

    if (user.status !== 'active') {
      return response.error(res, '账号已被禁用', 403);
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return response.error(res, '密码错误', 401);
    }

    const token = jwt.generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    response.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        email: user.email,
        points: user.points,
        role: user.role
      }
    }, '登录成功');
  } catch (error) {
    console.error('登录错误:', error);
    response.error(res, '登录失败：' + error.message, 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password']
      }
    });

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    response.success(res, { user });
  } catch (error) {
    console.error('获取资料错误:', error);
    response.error(res, '获取资料失败', 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nickname, bio, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    if (nickname) user.nickname = nickname;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    response.success(res, {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        points: user.points
      }
    }, '资料更新成功');
  } catch (error) {
    console.error('更新资料错误:', error);
    response.error(res, '更新失败', 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return response.error(res, '用户不存在', 404);
    }

    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      return response.error(res, '原密码错误', 400);
    }

    user.password = newPassword;
    await user.save();

    response.success(res, null, '密码修改成功');
  } catch (error) {
    console.error('修改密码错误:', error);
    response.error(res, '修改失败', 500);
  }
};
