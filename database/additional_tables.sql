-- 用户等级表
CREATE TABLE IF NOT EXISTS `user_levels` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `minPoints` INT DEFAULT 0,
  `minPlans` INT DEFAULT 0,
  `minUnlocks` INT DEFAULT 0,
  `discount` DECIMAL(3,2) DEFAULT 1.00,
  `icon` VARCHAR(20),
  `color` VARCHAR(20) DEFAULT '#6c757d',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `planId` INT NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_favorite` (`userId`, `planId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 点赞表
CREATE TABLE IF NOT EXISTS `likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `planId` INT NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_like` (`userId`, `planId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `planId` INT NOT NULL,
  `parentId` INT,
  `content` TEXT NOT NULL,
  `likeCount` INT DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'active',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plan` (`planId`),
  INDEX `idx_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 标签表
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `type` VARCHAR(20) DEFAULT 'sport',
  `color` VARCHAR(20) DEFAULT '#007bff',
  `sort` INT DEFAULT 0,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 方案标签关联表
CREATE TABLE IF NOT EXISTS `plan_tags` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `planId` INT NOT NULL,
  `tagId` INT NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_plan_tag` (`planId`, `tagId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化默认用户等级
INSERT INTO `user_levels` (`name`, `minPoints`, `icon`, `color`) VALUES
('新手', 0, '🌱', '#6c757d'),
('普通', 500, '📊', '#17a2b8'),
('进阶', 2000, '📈', '#28a745'),
('专家', 5000, '⭐', '#ffc107'),
('达人', 10000, '🏆', '#fd7e14'),
('大师', 30000, '👑', '#dc3545');

-- 初始化默认标签
INSERT INTO `tags` (`name`, `type`, `color`, `sort`) VALUES
('足球', 'sport', '#28a745', 1),
('篮球', 'sport', '#dc3545', 2),
('网球', 'sport', '#ffc107', 3),
('英超', 'league', '#6f42c1', 10),
('西甲', 'league', '#e83e8c', 11),
('意甲', 'league', '#20c997', 12),
('德甲', 'league', '#fd7e14', 13),
('欧冠', 'league', '#007bff', 14),
('NBA', 'league', '#dc3545', 15);
