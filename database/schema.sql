-- 竞彩 + 福彩投注方案分享平台数据库结构
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS lottery_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lottery_platform;

-- 用户表
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '加密密码',
  `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
  `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
  `avatar` VARCHAR(255) DEFAULT '/default-avatar.png' COMMENT '头像 URL',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `bio` TEXT COMMENT '个人简介',
  `points` INT UNSIGNED DEFAULT 100 COMMENT '积分余额',
  `total_points_earned` INT UNSIGNED DEFAULT 100 COMMENT '累计获得积分',
  `total_points_spent` INT UNSIGNED DEFAULT 0 COMMENT '累计消耗积分',
  `last_signin_date` DATE NULL COMMENT '最后签到日期',
  `consecutive_signin_days` INT UNSIGNED DEFAULT 0 COMMENT '连续签到天数',
  `role` ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色',
  `status` ENUM('active', 'banned', 'pending') DEFAULT 'active' COMMENT '账号状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (`username`),
  INDEX idx_phone (`phone`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 签到记录表
CREATE TABLE `signin_records` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `signin_date` DATE NOT NULL COMMENT '签到日期',
  `points_earned` INT UNSIGNED NOT NULL DEFAULT 20 COMMENT '获得积分',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (`user_id`, `signin_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_signin_date (`signin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签到记录表';

-- 广告表
CREATE TABLE `ads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '广告名称',
  `position` ENUM('header_banner', 'list_top', 'list_middle', 'list_bottom', 'detail_top', 'detail_side', 'detail_bottom', 'footer', 'points_wall') NOT NULL COMMENT '广告位置',
  `ad_type` ENUM('image', 'js_code', 'html') DEFAULT 'js_code' COMMENT '广告类型',
  `js_code` TEXT COMMENT '广告联盟 JS 代码',
  `image_url` VARCHAR(255) COMMENT '图片广告 URL',
  `link_url` VARCHAR(255) COMMENT '跳转链接',
  `points_reward` INT UNSIGNED DEFAULT 10 COMMENT '观看奖励积分',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT '展示次数',
  `click_count` INT UNSIGNED DEFAULT 0 COMMENT '点击次数',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `platform` ENUM('pc', 'mobile', 'all') DEFAULT 'all' COMMENT '适用平台',
  `priority` INT UNSIGNED DEFAULT 0 COMMENT '优先级（数字越大越优先）',
  `start_date` DATETIME NULL COMMENT '开始日期',
  `end_date` DATETIME NULL COMMENT '结束日期',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (`position`),
  INDEX idx_is_active (`is_active`),
  INDEX idx_platform (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='广告表';

-- 广告观看记录表
CREATE TABLE `ad_view_records` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `ad_id` INT UNSIGNED NOT NULL,
  `points_reward` INT UNSIGNED NOT NULL COMMENT '奖励积分',
  `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(50) COMMENT 'IP 地址',
  `user_agent` VARCHAR(255) COMMENT '用户代理',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ad_id`) REFERENCES `ads`(`id`) ON DELETE CASCADE,
  INDEX idx_user_time (`user_id`, `viewed_at`),
  INDEX idx_ad_time (`ad_id`, `viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='广告观看记录表';

-- 彩种表
CREATE TABLE `lottery_types` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '彩种名称',
  `code` VARCHAR(20) NOT NULL UNIQUE COMMENT '彩种代码',
  `icon` VARCHAR(100) COMMENT '图标',
  `description` VARCHAR(255) COMMENT '描述',
  `sort_order` INT UNSIGNED DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (`code`),
  INDEX idx_sort (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='彩种表';

-- 投注方案表
CREATE TABLE `betting_plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '作者 ID',
  `lottery_type_id` INT UNSIGNED NOT NULL COMMENT '彩种 ID',
  `title` VARCHAR(200) NOT NULL COMMENT '方案标题',
  `summary` VARCHAR(500) COMMENT '方案摘要',
  `content` TEXT NOT NULL COMMENT '方案详细内容',
  `match_info` JSON COMMENT '赛事信息（对阵、时间等）',
  `prediction` VARCHAR(255) COMMENT '推荐结果',
  `odds` DECIMAL(10,2) COMMENT '赔率',
  `confidence` TINYINT UNSIGNED COMMENT '信心指数（1-5）',
  `plan_type` ENUM('single', 'combine', 'system') DEFAULT 'single' COMMENT '方案类型',
  `price_points` INT UNSIGNED DEFAULT 50 COMMENT '查看所需积分',
  `status` ENUM('draft', 'published', 'reviewing', 'rejected', 'hidden') DEFAULT 'reviewing' COMMENT '状态',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT '查看次数',
  `unlock_count` INT UNSIGNED DEFAULT 0 COMMENT '解锁次数',
  `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
  `collect_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏数',
  `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论数',
  `hit_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '命中率（%）',
  `review_notes` TEXT COMMENT '审核备注',
  `published_at` DATETIME NULL COMMENT '发布时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lottery_type_id`) REFERENCES `lottery_types`(`id`),
  INDEX idx_user (`user_id`),
  INDEX idx_lottery_type (`lottery_type_id`),
  INDEX idx_status (`status`),
  INDEX idx_published (`published_at`),
  INDEX idx_hit_rate (`hit_rate`),
  FULLTEXT idx_title_content (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投注方案表';

-- 方案解锁记录表
CREATE TABLE `plan_unlock_records` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户 ID',
  `plan_id` INT UNSIGNED NOT NULL COMMENT '方案 ID',
  `author_id` INT UNSIGNED NOT NULL COMMENT '作者 ID',
  `points_cost` INT UNSIGNED NOT NULL COMMENT '消耗积分',
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(50) COMMENT 'IP 地址',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `betting_plans`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY unique_user_plan (`user_id`, `plan_id`),
  INDEX idx_user_time (`user_id`, `unlocked_at`),
  INDEX idx_plan (`plan_id`),
  INDEX idx_author (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案解锁记录表';

-- 积分明细表
CREATE TABLE `points_ledger` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户 ID',
  `type` ENUM('earn', 'spend') NOT NULL COMMENT '类型：收入/支出',
  `category` ENUM('signin', 'ad_view', 'plan_unlock', 'like_reward', 'admin_adjust', 'refund', 'other') NOT NULL COMMENT '分类',
  `amount` INT NOT NULL COMMENT '积分变动（正数收入，负数支出）',
  `balance_after` INT UNSIGNED NOT NULL COMMENT '变动后余额',
  `description` VARCHAR(255) COMMENT '描述',
  `reference_id` INT UNSIGNED COMMENT '关联 ID（方案 ID、广告 ID 等）',
  `reference_type` VARCHAR(50) COMMENT '关联类型',
  `ip_address` VARCHAR(50) COMMENT 'IP 地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_user_time (`user_id`, `created_at`),
  INDEX idx_type (`type`),
  INDEX idx_category (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分明细账本表';

-- 点赞表
CREATE TABLE `likes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `plan_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_plan (`user_id`, `plan_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `betting_plans`(`id`) ON DELETE CASCADE,
  INDEX idx_plan (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- 收藏表
CREATE TABLE `collections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `plan_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_plan (`user_id`, `plan_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `betting_plans`(`id`) ON DELETE CASCADE,
  INDEX idx_user (`user_id`),
  INDEX idx_plan (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 关注表
CREATE TABLE `follows` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `follower_id` INT UNSIGNED NOT NULL COMMENT '关注者 ID',
  `following_id` INT UNSIGNED NOT NULL COMMENT '被关注 ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follower_following (`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_follower (`follower_id`),
  INDEX idx_following (`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- 评论表
CREATE TABLE `comments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `plan_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `parent_id` INT UNSIGNED NULL COMMENT '父评论 ID（用于回复）',
  `content` TEXT NOT NULL,
  `like_count` INT UNSIGNED DEFAULT 0,
  `status` ENUM('published', 'hidden', 'deleted') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`plan_id`) REFERENCES `betting_plans`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  INDEX idx_plan (`plan_id`),
  INDEX idx_user (`user_id`),
  INDEX idx_parent (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 系统配置表
CREATE TABLE `system_configs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` TEXT,
  `config_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `description` VARCHAR(255),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 操作日志表
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) COMMENT '模块',
  `ip_address` VARCHAR(50),
  `user_agent` VARCHAR(255),
  `request_data` JSON,
  `response_status` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX idx_user_time (`user_id`, `created_at`),
  INDEX idx_action (`action`),
  INDEX idx_time (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 插入默认数据
-- 默认管理员账号（密码：admin123）
INSERT INTO `users` (`username`, `password`, `phone`, `nickname`, `points`, `role`, `status`) 
VALUES ('admin', '$2b$10$rQZ9vXJxL5K5Z5Z5Z5Z5ZeQZ9vXJxL5K5Z5Z5Z5Z5ZeQZ9vXJxL5K', '13800138000', '管理员', 1000, 'admin', 'active');

-- 彩种数据
INSERT INTO `lottery_types` (`name`, `code`, `description`, `sort_order`) VALUES
('竞彩足球', 'jczq', '竞彩足球投注方案', 1),
('竞彩篮球', 'jclq', '竞彩篮球投注方案', 2),
('双色球', 'ssq', '福彩双色球', 3),
('大乐透', 'dlt', '体彩大乐透', 4),
('福彩 3D', 'fc3d', '福彩 3D', 5),
('排列三', 'pls', '体彩排列三', 6),
('排列五', 'plw', '体彩排列五', 7),
('七星彩', 'qxc', '体彩七星彩', 8),
('七乐彩', 'qlc', '福彩七乐彩', 9),
('快乐 8', 'kl8', '福彩快乐 8', 10);

-- 系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('signin_points', '20', 'number', '每日签到获得积分'),
('ad_view_points', '10', 'number', '观看广告获得积分'),
('default_plan_points', '50', 'number', '默认方案查看消耗积分'),
('min_unlock_points', '10', 'number', '最低方案积分'),
('max_unlock_points', '500', 'number', '最高方案积分'),
('like_reward_points', '2', 'number', '点赞作者奖励积分'),
('signin_continuous_bonus', '5', 'number', '连续签到额外奖励（每 7 天）'),
('site_name', '竞彩福彩投注方案分享平台', 'string', '网站名称'),
('site_description', '专业竞彩足球、篮球、福彩、体彩投注方案分享社区', 'string', '网站描述'),
('allow_register', '1', 'boolean', '允许注册'),
('require_review', '1', 'boolean', '方案需要审核'),
('ad_enabled', '1', 'boolean', '启用广告');

INSERT INTO `ads` (`name`, `position`, `ad_type`, `js_code`, `points_reward`, `is_active`, `platform`, `priority`) VALUES
('顶部横幅广告', 'header_banner', 'js_code', '<!-- 在此粘贴广告联盟 JS 代码 -->', 10, 1, 'all', 100),
('列表页顶部广告', 'list_top', 'js_code', '<!-- 在此粘贴广告联盟 JS 代码 -->', 10, 1, 'all', 90),
('列表页中部广告', 'list_middle', 'js_code', '<!-- 在此粘贴广告联盟 JS 代码 -->', 10, 1, 'all', 80),
('详情页顶部广告', 'detail_top', 'js_code', '<!-- 在此粘贴广告联盟 JS 代码 -->', 10, 1, 'all', 95),
('详情页侧边广告', 'detail_side', 'js_code', '<!-- 在此粘贴广告联盟 JS 代码 -->', 10, 1, 'pc', 85),
('赚积分广告墙', 'points_wall', 'js_code', '<!-- 在此粘贴广告联盟 JS 代码 -->', 10, 1, 'all', 100);
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统配置表（用于存储 AI 配置等）
CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` TEXT NOT NULL,
  `description` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化 AI 供应商数据
INSERT INTO `ai_providers` (`provider_key`, `provider_name`, `models`, `enabled`) VALUES
('openai', 'OpenAI', '["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"]', FALSE),
('anthropic', 'Anthropic', '["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]', FALSE),
('azure', 'Azure OpenAI', '["gpt-4", "gpt-35-turbo"]', FALSE),
('custom', '自定义供应商', '[]', FALSE);
