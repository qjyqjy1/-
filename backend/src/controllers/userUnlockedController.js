const { Op } = require('sequelize');
const UserUnlockedPlan = require('../models/UserUnlockedPlan');
const PrizeRecord = require('../models/PrizeRecord');
const BettingPlan = require('../models/BettingPlan');
const LotteryResult = require('../models/LotteryResult');

// 用户已解锁方案列表
const getMyUnlocked = async (req, res) => {
 try {
 const userId = req.user.id;
 const unlocked = await UserUnlockedPlan.getUserPlans(userId);

 const plans = [];
 for (const record of unlocked) {
 const plan = await BettingPlan.findByPk(record.planId, {
 include: [{ as: 'author', attributes: ['id', 'username', 'avatar'] }]
 });
 if (plan) {
 plans.push({
 ...plan.toJSON(),
 isWinner: record.isWinner,
 prizeAmount: record.prizeAmount,
 unlockedAt: record.unlockedAt
 });
 }
 }

 res.json({ success: true, data: plans });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};

// 用户中奖记录
const getMyPrizes = async (req, res) => {
 try {
 const userId = req.user.id;
 const { status = 'all' } = req.query;

 const records = await PrizeRecord.getUserPrizes(userId, status);
 res.json({ success: true, data: records });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};

// 自动中奖检查器
class PrizeChecker {
 // 判断方案是否中奖
 static checkPlan(plan, lotteryResult) {
 if (!plan || !lotteryResult) return null;

 const content = plan.content?.toLowerCase() || '';
 const analysis = plan.analysis?.toLowerCase() || '';
 const fullText = content + ' ' + analysis;

 //竞彩类：胜/平/负
 if (['jc_football', 'jc_basketball'].includes(plan.lotteryType)) {
 if (fullText.includes('负') && lotteryResult.awayScore > lotteryResult.homeScore) return true;
 if (fullText.includes('平') && lotteryResult.awayScore === lotteryResult.homeScore) return true;
 if (fullText.includes('胜') && lotteryResult.homeScore > lotteryResult.awayScore) return true;
 if (fullText.includes('让胜') || fullText.includes('让平') || fullText.includes('让负')) {
 return null;
 }
 }

 // 快乐8：数字匹配
 if (plan.lotteryType === 'kl8') {
 const winningNums = lotteryResult.winningNumbers?.split(',').map(n => parseInt(n.trim(),10)) || [];
 const planNums = this.extractNumbers(content);

 if (planNums.length ===0) return null;

 const matched = planNums.filter(n => winningNums.includes(n));
 if (matched.length >=4) return true;
 }

 // 数字彩：包含指定数字
 if (['ssq', 'dlt', '3d', 'p5', 'qlc'].includes(plan.lotteryType)) {
 const winningNums = lotteryResult.winningNumbers?.split(',').map(n => n.trim()) || [];
 const planNums = this.extractNumbers(content);

 if (planNums.length ===0) return null;

 const matched = planNums.filter(n => winningNums.includes(n.toString()));
 if (matched.length >=2) return true;
 }

 return false;
 }

 // 提取文本中的数字
 static extractNumbers(text) {
 const matches = text.match(/\d+/g) || [];
 return matches.map(n => parseInt(n,10)).filter(n => n >0 && n <=80);
 }

 //估计奖金（根据彩种和匹配数量）
 static estimatePrize(lotteryType, matchedCount) {
 const prizeTable = {
 kl8: {4:5,5:10,6:50,7:200,8:1000 },
 ssq: {2:5,3:10,4:100,5:3000,6:5000000 },
 dlt: {2:5,3:10,4:100,5:10000,6:1000000 },
 '3d': {2:10,3:1000 },
 p5: {5:100000 },
 qlc: {2:5,3:10,4:200,5:5000 }
 };

 const table = prizeTable[lotteryType];
 if (!table) return0;

 for (let count = matchedCount; count >=0; count -=1) {
 if (table[count]) return table[count];
 }
 return0;
 }

 // 检查所有用户方案
 static async checkAll() {
 const uncheckedPlans = await UserUnlockedPlan.findAll({
 where: {
 isWinner: null
 },
 include: [{
 model: BettingPlan,
 required: true
 }]
 });

 let checked =0;
 for (const record of uncheckedPlans) {
 const plan = record.BettingPlan;
 if (!plan) continue;

 const result = await LotteryResult.findOne({
 where: { lotteryType: plan.lotteryType },
 order: [['drawDate', 'DESC']]
 });

 if (!result) continue;

 const isWinner = this.checkPlan(plan, result);
 if (isWinner !== null) {
 const prizeAmount = isWinner ? this.estimatePrize(plan.lotteryType,4) :0;

 await record.update({
 isWinner,
 prizeAmount,
 checkedAt: new Date()
 });

 if (isWinner) {
 await PrizeRecord.create({
 userId: record.userId,
 planId: record.planId,
 lotteryType: plan.lotteryType,
 issueNumber: result.issueNumber,
 planContent: plan.content,
 prizeLevel: '普奖',
 prizeAmount,
 status: 'paid'
 });
 }

 checked +=1;
 }
 }

 return checked;
 }
}

const checkPrizes = async (req, res) => {
 try {
 const checked = await PrizeChecker.checkAll();
 res.json({ success: true, message: '中奖检查完成', data: { checked } });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
};

module.exports = { getMyUnlocked, getMyPrizes, checkPrizes, PrizeChecker };
