const jwt = require('jsonwebtoken');

module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  expire: process.env.JWT_EXPIRE || '7d',

  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expire });
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
};
