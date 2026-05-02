-- v3.0 数据库迁移脚本

-- 1. 会员体系表
CREATE TABLE IF NOT EXISTS `memberships` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL UNIQUE,
  `level` TINYINT DEFAULT 1 COMMENT '1:普通 2:VIP 3:SVIP',
  `start_date` DATETIME,
  `end_date` DATETIME,
  `benefits` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `membership_orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `order_no` VARCHAR(50) UNIQUE,
  `level` TINYINT NOT NULL,
  `duration_days` INT DEFAULT 30,
  `original_price` DECIMAL(10,2),
  `actual_amount` DECIMAL(10,2),
  `status` VARCHAR(20) DEFAULT 'pending',
  `payment_method` VARCHAR(20),
  `paid_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 广告主平台表
CREATE TABLE IF NOT EXISTS `advertisers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `company_name` VARCHAR(100),
  `license_no` VARCHAR(50),
  `contact_name` VARCHAR(50),
  `contact_phone` VARCHAR(20),
  `balance` DECIMAL(15,2) DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'pending',
  `verified_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ad_campaigns` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `advertiser_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `budget` DECIMAL(15,2) NOT NULL,
  `spent` DECIMAL(15,2) DEFAULT 0,
  `start_date` DATETIME,
  `end_date` DATETIME,
  `status` VARCHAR(20) DEFAULT 'pending',
  `targeting` JSON COMMENT '{age:[],gender:'',locations:[]}',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_advertiser` (`advertiser_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. WebSocket 消息队列表
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(100),
  `content` TEXT,
  `data` JSON,
  `is_read` BOOLEAN DEFAULT FALSE,
  `read_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. AI 对话历史表
CREATE TABLE IF NOT EXISTS `ai_chat_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `session_id` VARCHAR(50),
  `message` TEXT NOT NULL,
  `response` TEXT,
  `tokens_used` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 用户行为分析表
CREATE TABLE IF NOT EXISTS `user_actions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `action_data` JSON,
  `ip` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_type` (`action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化会员配置
CREATE TABLE IF NOT EXISTS `membership_configs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `level` TINYINT UNIQUE NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `price_monthly` DECIMAL(10,2) NOT NULL,
  `price_yearly` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(3,2) DEFAULT 1.00,
  `benefits` JSON,
  `icon` VARCHAR(50),
  `color` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `membership_configs` (`level`, `name`, `price_monthly`, `price_yearly`, `discount`, `benefits`, `icon`, `color`) VALUES
(1, '普通会员', 0, 0, 1.00, '{"free_ads":0,"unlock_discount":1.0,"ai_daily":0}', '🌱', '#6c757d'),
(2, 'VIP', 19.90, 199.00, 0.90, '{"free_ads":true,"unlock_discount":0.9,"ai_daily":10,"badge":"vip"}', '⭐', '#ffc107'),
(3, 'SVIP', 39.90, 399.00, 0.70, '{"free_ads":true,"unlock_discount":0.7,"ai_daily":-1,"badge":"svip","priority_support":true}', '👑', '#dc3545');
COMMIT;
