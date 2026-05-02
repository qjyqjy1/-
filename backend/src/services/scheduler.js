const { Op } = require('sequelize');

class Scheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    setInterval(() => this.runTasks(), 60 * 1000);
    console.log('🕒 定时任务调度器已启动');
  }

  addTask(name, schedule, fn) {
    this.tasks.push({ name, schedule, fn, lastRun: 0 });
  }

  async runTasks() {
    const now = Date.now();
    for (const task of this.tasks) {
      if (now - task.lastRun >= task.schedule) {
        try {
          console.log(`📋 执行任务：${task.name}`);
          await task.fn();
          task.lastRun = now;
        } catch (error) {
          console.error(`❌ 任务失败：${task.name}`, error);
        }
      }
    }
  }

  async expirePoints() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const User = require('../models/User');
    const PointsLog = require('../models/PointsLog');
    
    const expiredLogs = await PointsLog.findAll({
      where: { type: 'signin', createdAt: { [Op.lt]: thirtyDaysAgo }, expired: false }
    });

    const userIds = [...new Set(expiredLogs.map(log => log.userId))];
    for (const userId of userIds) {
      const userLogs = expiredLogs.filter(log => log.userId === userId);
      const totalExpired = userLogs.reduce((sum, log) => sum + log.points, 0);
      const user = await User.findByPk(userId);
      if (user && user.points >= totalExpired) {
        await user.decrement('points', { by: totalExpired });
        for (const log of userLogs) await log.update({ expired: true });
      }
    }
    console.log(`  处理完成`);
  }

  async cleanAdClicks() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const AdClick = require('../models/AdClick');
    await AdClick.destroy({ where: { createdAt: { [Op.lt]: oneDayAgo } } });
  }

  async autoPublishPlans() {
    const BettingPlan = require('../models/BettingPlan');
    const { replaceSensitive } = require('../middleware/sensitiveFilter');
    
    const plans = await BettingPlan.findAll({ where: { status: 'pending' } });
    for (const plan of plans) {
      await plan.update({
        title: replaceSensitive(plan.title),
        content: replaceSensitive(plan.content),
        analysis: replaceSensitive(plan.analysis),
        status: 'published',
        publishedAt: new Date()
      });
    }
    if (plans.length > 0) console.log(`  发布 ${plans.length} 个方案`);
  }

  async dailyStats() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      const { User, BettingPlan, PointsLog, AdClick } = require('../models');
      const newUsers = await User.count({ where: { createdAt: { [Op.gte]: yesterday, [Op.lt]: today } } });
      const newPlans = await BettingPlan.count({ where: { createdAt: { [Op.gte]: yesterday, [Op.lt]: today } } });
      console.log(`  昨日数据：新用户=${newUsers}, 新方案=${newPlans}`);
    } catch (error) {}
  }
}

const scheduler = new Scheduler();
scheduler.addTask('积分过期处理', 24 * 60 * 60 * 1000, () => scheduler.expirePoints());
scheduler.addTask('清理广告记录', 60 * 60 * 1000, () => scheduler.cleanAdClicks());
scheduler.addTask('自动发布方案', 5 * 60 * 1000, () => scheduler.autoPublishPlans());
scheduler.addTask('每日统计', 24 * 60 * 60 * 1000, () => scheduler.dailyStats());

module.exports = scheduler;

// 任务 5: 检查中奖（每 10 分钟执行）
async function checkPrizes() {
  try {
    const { PrizeChecker } = require('../controllers/userUnlockedController');
    const checked = await PrizeChecker.checkAll();
    if (checked > 0) console.log(`  检查中奖：${checked} 个方案`);
  } catch (error) {
    console.error('  中奖检查失败:', error);
  }
}
scheduler.addTask('中奖检查', 10 * 60 * 1000, checkPrizes);
