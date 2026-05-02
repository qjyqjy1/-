-- AI 功能相关数据表

-- AI 供应商配置表
CREATE TABLE IF NOT EXISTS `ai_providers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `provider_key` VARCHAR(50) NOT NULL UNIQUE,
  `provider_name` VARCHAR(100) NOT NULL,
  `api_key` VARCHAR(500),
  `base_url` VARCHAR(500),
  `default_model` VARCHAR(100),
  `models` JSON,
  `enabled` BOOLEAN DEFAULT FALSE,
  `config` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI 调用历史记录表
CREATE TABLE IF NOT EXISTS `ai_calls` (
  `id` VARCHAR(36) PRIMARY KEY,
  `provider` VARCHAR(50) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `messages` JSON NOT NULL,
  `response` TEXT,
  `usage` JSON,
  `user_id` INT,
  `status` VARCHAR(20) DEFAULT 'success',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_provider` (`provider`),
  INDEX `idx_user_id` (`user_id`),
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
