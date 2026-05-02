/**
 * 广告防刷机制脚本
 * 功能：防止用户刷广告积分
 */

class AdAntiCheat {
  constructor() {
    this.ipClickLimit = 10; // 单 IP 日点击上限
    this.userViewLimit = 50; // 单账号日观看上限
    this.minWatchTime = 15; // 最小观看时长（秒）
    this.cooldownTime = 60; // 冷却时间（秒）
    this.storagePrefix = 'ad_anti_cheat_';
  }

  // 获取今日已经观看次数
  getTodayViewCount(userId) {
    const key = this.storagePrefix + 'views_' + userId + '_' + this.getTodayDate();
    return parseInt(localStorage.getItem(key) || '0');
  }

  // 增加观看次数
  incrementViewCount(userId) {
    const key = this.storagePrefix + 'views_' + userId + '_' + this.getTodayDate();
    const count = this.getTodayViewCount(userId);
    localStorage.setItem(key, count + 1);
  }

  // 检查是否可以观看广告
  canViewAd(userId, adId) {
    // 检查账号观看上限
    if (this.getTodayViewCount(userId) >= this.userViewLimit) {
      return {
        allowed: false,
        reason: '今日观看次数已达上限'
      };
    }

    // 检查冷却时间
    const lastViewKey = this.storagePrefix + 'last_view_' + userId + '_' + adId;
    const lastViewTime = parseInt(localStorage.getItem(lastViewKey) || '0');
    const now = Date.now();
    
    if (now - lastViewTime < this.cooldownTime * 1000) {
      const remaining = Math.ceil((this.cooldownTime * 1000 - (now - lastViewTime)) / 1000);
      return {
        allowed: false,
        reason: `广告冷却中，请${remaining}秒后再试`,
        cooldown: remaining
      };
    }

    return {
      allowed: true,
      reason: ''
    };
  }

  // 记录观看时间
  recordViewTime(userId, adId) {
    const lastViewKey = this.storagePrefix + 'last_view_' + userId + '_' + adId;
    localStorage.setItem(lastViewKey, Date.now().toString());
    this.incrementViewCount(userId);
  }

  // 验证观看时长（返回是否应该发放积分）
  validateWatchTime(actualSeconds) {
    return actualSeconds >= this.minWatchTime;
  }

  // 获取设备指纹
  getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    return canvas.toDataURL().slice(0, 100);
  }

  // 检查设备是否被拉黑
  isDeviceBlacklisted(fingerprint) {
    const blacklistKey = this.storagePrefix + 'device_blacklist';
    const blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '[]');
    return blacklist.includes(fingerprint);
  }

  // 添加设备到黑名单
  blacklistDevice(fingerprint, reason) {
    const blacklistKey = this.storagePrefix + 'device_blacklist';
    const blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '[]');
    if (!blacklist.includes(fingerprint)) {
      blacklist.push(fingerprint);
      localStorage.setItem(blacklistKey, JSON.stringify(blacklist));
      console.log('设备已加入黑名单:', reason);
    }
  }

  // 检测异常行为
  detectAbnormalBehavior(userId) {
    const views = this.getTodayViewCount(userId);
    const fingerprint = this.getDeviceFingerprint();
    
    // 如果观看次数异常高
    if (views > this.userViewLimit * 0.8) {
      // 标记为可疑
      console.warn('检测到可疑行为：观看次数过多');
      return 'suspicious';
    }

    // 检查是否多账号同设备
    const deviceUsersKey = this.storagePrefix + 'device_users_' + fingerprint;
    const deviceUsers = JSON.parse(localStorage.getItem(deviceUsersKey) || '[]');
    
    if (!deviceUsers.includes(userId)) {
      deviceUsers.push(userId);
      localStorage.setItem(deviceUsersKey, JSON.stringify(deviceUsers));
    }

    // 如果同一设备超过 5 个账号
    if (deviceUsers.length > 5) {
      this.blacklistDevice(fingerprint, '同一设备多账号刷分');
      return 'blacklisted';
    }

    return 'normal';
  }

  // 获取今日日期字符串
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // 清理过期数据（每日执行一次）
  cleanupExpiredData() {
    const today = this.getTodayDate();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // 清理昨天的观看记录
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix) && key.includes(yesterday)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// 全局实例
window.adAntiCheat = new AdAntiCheat();

// 页面加载时检查
document.addEventListener('DOMContentLoaded', function() {
  window.adAntiCheat.cleanupExpiredData();
});

// 导出供广告模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdAntiCheat;
}
