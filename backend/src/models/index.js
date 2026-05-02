const sequelize = require('../config/db');

const User = require('./User');
const BettingPlan = require('./BettingPlan');
const PointsLedger = require('./PointsLedger');
const Ad = require('./Ad');
const AdViewRecord = require('./AdViewRecord');
const SystemConfig = require('./SystemConfig');
const AIModel = require('./AIModel');
const UserLevel = require('./UserLevel');
const Favorite = require('./Favorite');
const Like = require('./Like');
const Comment = require('./Comment');
const Tag = require('./Tag');

// v3.0 新增模型
const Membership = require('./Membership');
const MembershipOrder = require('./MembershipOrder');
const Advertiser = require('./Advertiser');
const AdCampaign = require('./AdCampaign');
const Notification = require('./Notification');
const AIChatHistory = require('./AIChatHistory');
const UserAction = require('./UserAction');

//兼容旧代码命名
const PointsLog = PointsLedger;
const AdClick = AdViewRecord;

//关联关系
BettingPlan.belongsTo(User, { as: 'author', foreignKey: 'userId' });
User.hasMany(BettingPlan, { as: 'plans', foreignKey: 'userId' });

PointsLedger.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PointsLedger, { foreignKey: 'userId' });

AdViewRecord.belongsTo(User, { foreignKey: 'userId' });
AdViewRecord.belongsTo(Ad, { foreignKey: 'adId' });

Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(BettingPlan, { foreignKey: 'planId' });

Like.belongsTo(User, { foreignKey: 'userId' });
Like.belongsTo(BettingPlan, { foreignKey: 'planId' });

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(BettingPlan, { foreignKey: 'planId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });

Tag.belongsToMany(BettingPlan, { through: 'plan_tags', foreignKey: 'tagId' });
BettingPlan.belongsToMany(Tag, { through: 'plan_tags', foreignKey: 'planId' });

module.exports = {
 sequelize,
 User,
 BettingPlan,
 PointsLedger,
 PointsLog,
 Ad,
 AdViewRecord,
 AdClick,
 SystemConfig,
 AIModel,
 UserLevel,
 Favorite,
 Like,
 Comment,
 Tag,
 Membership,
 MembershipOrder,
 Advertiser,
 AdCampaign,
 Notification,
 AIChatHistory,
 UserAction
};
