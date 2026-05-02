const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Notification = require('../models/v3/Notification');

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.on('connection', (socket) => {
      console.log('🔌 Socket connected:', socket.id);

      socket.on('join', async (data) => {
        const { token } = data;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          socket.join(`user:${decoded.id}`);
          socket.userId = decoded.id;
        } catch (error) {
          console.error('JWT 验证失败:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected:', socket.id);
      });
    });

    return io;
  },

  sendNotification: async (userId, type, title, content, data = {}) => {
    await Notification.createNotification(userId, type, title, content, data);
    if (io) {
      io.to(`user:${userId}`).emit('notification', { type, title, content, data, timestamp: new Date().toISOString() });
    }
  },

  broadcast: (event, data) => {
    if (io) io.emit(event, data);
  },

  getIO: () => io
};
