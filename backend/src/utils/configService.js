const { SystemConfig } = require('../models');

class ConfigService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 60000;
  }

  async get(key, defaultValue = null) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return this.parseValue(cached.value, defaultValue);
    }

    const config = await SystemConfig.findOne({ where: { configKey: key } });
    if (config) {
      this.cache.set(key, { value: config.configValue, timestamp: Date.now() });
      return this.parseValue(config.configValue, defaultValue);
    }

    return defaultValue;
  }

  async set(key, value, description = null) {
    const config = await SystemConfig.findOne({ where: { configKey: key } });
    
    if (config) {
      config.configValue = String(value);
      await config.save();
    } else {
      await SystemConfig.create({
        configKey: key,
        configValue: String(value),
        description
      });
    }

    this.cache.delete(key);
  }

  parseValue(value, defaultValue) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value;
  }

  async getAll() {
    const configs = await SystemConfig.findAll();
    const result = {};
    
    for (const config of configs) {
      result[config.configKey] = this.parseConfigValue(config.configValue, config.configType);
    }
    
    return result;
  }

  parseConfigValue(value, type) {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === '1' || value === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }
}

module.exports = new ConfigService();
