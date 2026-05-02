const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LotteryMatch = sequelize.define('LotteryMatch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lotteryType: { type: DataTypes.STRING, allowNull: false, field: 'lottery_type' },
  matchId: { type: DataTypes.STRING, unique: true, allowNull: false, field: 'match_id' },
  league: { type: DataTypes.STRING },
  homeTeam: { type: DataTypes.STRING, allowNull: false, field: 'home_team' },
  awayTeam: { type: DataTypes.STRING, allowNull: false, field: 'away_team' },
  matchTime: { type: DataTypes.DATE, allowNull: false, field: 'match_time' },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
  homeScore: { type: DataTypes.INTEGER, field: 'home_score' },
  awayScore: { type: DataTypes.INTEGER, field: 'away_score' },
  halfTimeScore: { type: DataTypes.STRING, field: 'half_time_score' },
  oddsWin: { type: DataTypes.DECIMAL(5, 2), field: 'odds_win' },
  oddsDraw: { type: DataTypes.DECIMAL(5, 2), field: 'odds_draw' },
  oddsLoss: { type: DataTypes.DECIMAL(5, 2), field: 'odds_loss' },
  isHot: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_hot' },
  dataSource: { type: DataTypes.STRING, defaultValue: 'manual', field: 'data_source' }
}, {
  tableName: 'lottery_matches',
  timestamps: true,
  indexes: [
    { fields: ['lottery_type'] },
    { fields: ['match_time'] },
    { fields: ['status'] }
  ]
});

// 今日赛程
LotteryMatch.getTodayMatches = async (type) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const where = { matchTime: { [require('sequelize').Op.between]: [start, end] } };
  if (type) where.lotteryType = type;

  return await LotteryMatch.findAll({
    where,
    order: [['matchTime', 'ASC']]
  });
};

module.exports = LotteryMatch;
