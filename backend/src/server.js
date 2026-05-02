const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const signinRoutes = require('./routes/signin');
const adRoutes = require('./routes/ads');
const pointsRoutes = require('./routes/points');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const lotteryTypeRoutes = require('./routes/lotteryTypes');
const websocket = require('./websocket/server');
const scheduler = require('./services/scheduler');
const favoritesRoutes = require('./routes/favorites');
const tagsRoutes = require('./routes/tags');
const searchRoutes = require('./routes/search');
const userUnlockedRoutes = require('./routes/userUnlocked');
const aiAnalystRoutes = require('./routes/ai-analyst');
const advertiserRoutes = require('./routes/advertiser');
const membershipRoutes = require('./routes/membership');
const lotteryRoutes = require('./routes/lottery');
const aiGenerateRoutes = require('./routes/ai-generate');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ||3001;

const allowedOrigins = process.env.ALLOWED_HOSTS === '*'
  ? null
  : (process.env.ALLOWED_HOSTS?.split(',') || ['http://localhost:5173', 'http://localhost:3000']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的 CORS 源'));
    }
  },
  credentials: true
}));

app.use(helmet({
 contentSecurityPolicy: false,
 crossOriginEmbedderPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
 windowMs:15 *60 *1000,
 max:100
});
app.use('/api', limiter);

const authLimiter = rateLimit({
 windowMs:15 *60 *1000,
 max:10
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/signin', signinRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lottery-types', lotteryTypeRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/advertiser', advertiserRoutes);
app.use('/api/ai-analyst', aiAnalystRoutes);
app.use('/api/user-unlocked', userUnlockedRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai-generate', aiGenerateRoutes);
app.use('/api/lottery', lotteryRoutes);

app.get('/api/health', (req, res) => {
 res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stats', async (req, res) => {
 try {
 const { User, BettingPlan } = require('./models');
 const [totalUsers, totalPlans, totalViews, totalUnlocks] = await Promise.all([
 User.count(),
 BettingPlan.count({ where: { status: 'published' } }),
 BettingPlan.sum('viewCount'),
 BettingPlan.sum('unlockCount')
 ]);
 res.json({
 success: true,
 data: {
 totalPlans: totalPlans ||0,
 activeUsers: totalUsers ||0,
 totalViews: totalViews ||0,
 totalUnlocks: totalUnlocks ||0
 }
 });
 } catch (error) {
 console.error('获取统计失败:', error);
 res.status(500).json({ success: false, message: '获取失败' });
 }
});

app.use((err, req, res, next) => {
 console.error('错误:', err);
 res.status(err.status ||500).json({
 success: false,
 message: err.message || '服务器内部错误'
 });
});

sequelize.sync().then(() => {
 console.log('数据库同步成功');
 websocket.init(server);
 scheduler.start();
 server.listen(PORT, () => {
 console.log(`服务器运行在端口 ${PORT}`);
 });
}).catch(err => {
 console.error('数据库同步失败:', err);
});
