-- 彩票赛程和开奖数据表

-- 竞彩足球赛程
CREATE TABLE IF NOT EXISTS `lottery_matches` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `lottery_type` VARCHAR(20) NOT NULL COMMENT '彩种：jc_football, jc_basketball',
  `match_id` VARCHAR(50) UNIQUE NOT NULL COMMENT '赛事 ID',
  `league` VARCHAR(100) COMMENT '联赛名称',
  `home_team` VARCHAR(100) NOT NULL,
  `away_team` VARCHAR(100) NOT NULL,
  `match_time` DATETIME NOT NULL,
  `status` VARCHAR(20) DEFAULT 'scheduled' COMMENT 'scheduled, playing, finished, cancelled',
  `home_score` INT DEFAULT NULL,
  `away_score` INT DEFAULT NULL,
  `half_time_score` VARCHAR(20) COMMENT '半场比分',
  `odds_win` DECIMAL(5,2) COMMENT '胜赔',
  `odds_draw` DECIMAL(5,2) COMMENT '平赔',
  `odds_loss` DECIMAL(5,2) COMMENT '负赔',
  `is_hot` BOOLEAN DEFAULT FALSE COMMENT '是否热门赛事',
  `data_source` VARCHAR(20) DEFAULT 'manual',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`lottery_type`),
  INDEX `idx_time` (`match_time`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 数字彩开奖结果
CREATE TABLE IF NOT EXISTS `lottery_results` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `lottery_type` VARCHAR(20) NOT NULL COMMENT '彩种：ssq, dlt, 3d, p5, qlc',
  `issue_number` VARCHAR(20) NOT NULL COMMENT '期号',
  `draw_date` DATE NOT NULL COMMENT '开奖日期',
  `draw_time` TIME DEFAULT '21:00:00' COMMENT '开奖时间',
  `winning_numbers` VARCHAR(100) NOT NULL COMMENT '开奖号码，逗号分隔',
  `special_number` VARCHAR(10) COMMENT '特别号码 (双色球蓝球等)',
  `prize_pool` DECIMAL(15,2) COMMENT '奖池金额',
  `sales_amount` DECIMAL(15,2) COMMENT '销售额',
  `prize_info` JSON COMMENT '奖金详情 [{level: "一等奖", count: 5, amount: 5000000}]',
  `next_issue` VARCHAR(20) COMMENT '下期期号',
  `next_pool` DECIMAL(15,2) COMMENT '下期预计奖池',
  `data_source` VARCHAR(20) DEFAULT 'manual',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_lottery_issue` (`lottery_type`, `issue_number`),
  INDEX `idx_type_date` (`lottery_type`, `draw_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 开奖历史缓存表
CREATE TABLE IF NOT EXISTS `lottery_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `lottery_type` VARCHAR(20) NOT NULL,
  `issue_number` VARCHAR(20) NOT NULL,
  `draw_date` DATE NOT NULL,
  `winning_numbers` VARCHAR(100) NOT NULL,
  `special_number` VARCHAR(10),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_type_issue` (`lottery_type`, `issue_number`),
  INDEX `idx_type` (`lottery_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化默认彩种配置
CREATE TABLE IF NOT EXISTS `lottery_configs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `lottery_type` VARCHAR(20) UNIQUE NOT NULL,
  `lottery_name` VARCHAR(50) NOT NULL,
  `draw_days` VARCHAR(20) COMMENT '开奖日：1,3,5 或 每天',
  `draw_time` TIME DEFAULT '21:00:00',
  `price` DECIMAL(5,2) DEFAULT 2.00 COMMENT '每注价格',
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `icon` VARCHAR(50),
  `color` VARCHAR(20) DEFAULT '#dc3545'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `lottery_configs` (`lottery_type`, `lottery_name`, `draw_days`, `draw_time`, `color`, `sort_order`) VALUES
('jc_football', '竞彩足球', '每天', '09:00:00', '#28a745', 1),
('jc_basketball', '竞彩篮球', '每天', '09:00:00', '#fd7e14', 2),
('ssq', '双色球', '2,4,7', '21:15:00', '#dc3545', 3),
('dlt', '大乐透', '1,3,6', '20:30:00', '#6f42c1', 4),
('3d', '福彩 3D', '每天', '21:00:00', '#20c997', 5),
('p5', '排列 5', '每天', '20:30:00', '#0d6efd', 6),
('qlc', '七乐彩', '1,3,5', '21:15:00', '#fd7e14', 7);

-- 补充：快乐 8 彩种
INSERT INTO `lottery_configs` (`lottery_type`, `lottery_name`, `draw_days`, `draw_time`, `color`, `sort_order`) VALUES
('kl8', '快乐 8', '每天', '21:00:00', '#20c997', 8) ON DUPLICATE KEY UPDATE `lottery_name`='快乐 8';

-- 用户已解锁方案表
CREATE TABLE IF NOT EXISTS `user_unlocked_plans` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `plan_id` INT NOT NULL,
  `unlock_points` INT NOT NULL COMMENT '解锁消耗积分',
  `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_winner` BOOLEAN DEFAULT NULL COMMENT '是否中奖：null-未开奖，true-中奖，false-未中',
  `prize_amount` DECIMAL(15,2) DEFAULT 0 COMMENT '中奖金额',
  `checked_at` DATETIME DEFAULT NULL COMMENT '检查时间',
  UNIQUE KEY `unique_user_plan` (`user_id`, `plan_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_plan` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 中奖记录表
CREATE TABLE IF NOT EXISTS `prize_records` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `plan_id` INT NOT NULL,
  `lottery_type` VARCHAR(20) NOT NULL,
  `issue_number` VARCHAR(20) NOT NULL,
  `plan_content` TEXT COMMENT '方案内容（如：负，或 8、10、15...）',
  `prize_level` VARCHAR(50) COMMENT '中奖等级',
  `prize_amount` DECIMAL(15,2) DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, claimed, paid',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_plan` (`plan_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
