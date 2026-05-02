const jwt = require('../config/jwt');

module.exports = {
  auth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '认证令牌无效或已过期'
      });
    }

    req.user = decoded;
    next();
  },

  admin: (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    next();
  },

  optionalAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  }
};
