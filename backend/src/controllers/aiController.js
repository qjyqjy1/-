const axios = require('axios');
const SystemConfig = require('../models/SystemConfig');

class AIService {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
        configKey: 'ai_openai'
      },
      anthropic: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        configKey: 'ai_anthropic'
      },
      azure: {
        name: 'Azure OpenAI',
        baseUrl: 'https://{resource}.openai.azure.com/openai/deployments/{deployment}',
        models: ['gpt-4', 'gpt-35-turbo'],
        configKey: 'ai_azure'
      },
      custom: {
        name: '自定义供应商',
        baseUrl: '',
        models: [],
        configKey: 'ai_custom'
      }
    };
  }

  // 获取配置的 AI 供应商
  async getConfiguredProviders() {
    const configs = await SystemConfig.findAll({
      where: { configKey: { startsWith: 'ai_' } }
    });
    
    const providers = [];
    for (const [key, provider] of Object.entries(this.providers)) {
      const config = configs.find(c => c.configKey === provider.configKey);
      if (config) {
        const settings = JSON.parse(config.configValue);
        providers.push({
          key,
          name: provider.name,
          enabled: settings.enabled || false,
          models: settings.models || provider.models,
          hasApiKey: !!settings.apiKey
        });
      } else {
        providers.push({
          key,
          name: provider.name,
          enabled: false,
          models: provider.models,
          hasApiKey: false
        });
      }
    }
    return providers;
  }

  // 保存 AI 供应商配置
  async saveProviderConfig(providerKey, config) {
    const provider = this.providers[providerKey];
    if (!provider) {
      throw new Error('不支持的供应商');
    }

    const configValue = JSON.stringify({
      enabled: config.enabled || false,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || provider.baseUrl,
      models: config.models || provider.models,
      defaultModel: config.defaultModel || (provider.models[0]),
      ...config.extra
    });

    await SystemConfig.upsert({
      configKey: provider.configKey,
      configValue,
      description: `${provider.name} AI 配置`
    });

    return { success: true };
  }

  // 添加自定义模型
  async addCustomModel(providerKey, model) {
    const config = await SystemConfig.findOne({
      where: { configKey: this.providers[providerKey].configKey }
    });

    if (!config) {
      throw new Error('供应商未配置');
    }

    const settings = JSON.parse(config.configValue);
    if (!settings.models) {
      settings.models = [];
    }
    
    if (!settings.models.includes(model)) {
      settings.models.push(model);
    }

    await config.update({
      configValue: JSON.stringify(settings)
    });

    return { success: true, models: settings.models };
  }

  // 调用 AI API
  async chat(providerKey, messages, options = {}) {
    const config = await SystemConfig.findOne({
      where: { configKey: this.providers[providerKey].configKey }
    });

    if (!config) {
      throw new Error('供应商未配置');
    }

    const settings = JSON.parse(config.configValue);
    
    if (!settings.enabled) {
      throw new Error('供应商未启用');
    }

    if (!settings.apiKey) {
      throw new Error('API Key 未配置');
    }

    const model = options.model || settings.defaultModel;

    try {
      let response;
      
      if (providerKey === 'openai' || providerKey === 'custom') {
        response = await this.callOpenAICompat(settings, messages, model);
      } else if (providerKey === 'anthropic') {
        response = await this.callAnthropic(settings, messages, model);
      } else if (providerKey === 'azure') {
        response = await this.callAzure(settings, messages, model, options.deployment);
      }

      return {
        success: true,
        content: response.content,
        model,
        usage: response.usage,
        provider: providerKey
      };
    } catch (error) {
      console.error(`AI 调用失败 (${providerKey}):`, error.message);
      throw new Error(`AI 调用失败：${error.message}`);
    }
  }

  // OpenAI 兼容接口
  async callOpenAICompat(settings, messages, model) {
    const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages,
        max_tokens: settings.maxTokens || 2000,
        temperature: settings.temperature || 0.7,
        ...settings.extra
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  // Anthropic Claude 接口
  async callAnthropic(settings, messages, model) {
    const response = await axios.post(
      `${settings.baseUrl}/messages`,
      {
        model,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
        max_tokens: settings.maxTokens || 2000,
        ...settings.extra
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.content[0].text,
      usage: response.data.usage
    };
  }

  // Azure OpenAI 接口
  async callAzure(settings, messages, model, deployment) {
    const deploymentName = deployment || model.replace('.', '');
    const baseUrl = settings.baseUrl
      .replace('{resource}', settings.resource)
      .replace('{deployment}', deploymentName);

    const response = await axios.post(
      `${baseUrl}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages,
        max_tokens: settings.maxTokens || 2000,
        temperature: settings.temperature || 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': settings.apiKey
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  // 测试连接
  async testConnection(providerKey) {
    try {
      const config = await SystemConfig.findOne({
        where: { configKey: this.providers[providerKey].configKey }
      });

      if (!config) {
        return { success: false, message: '未配置' };
      }

      const settings = JSON.parse(config.configValue);
      
      if (!settings.apiKey) {
        return { success: false, message: 'API Key 未配置' };
      }

      // 简单测试
      await this.chat(providerKey, [
        { role: 'user', content: 'Hello' }
      ], { model: settings.defaultModel });

      return { success: true, message: '连接成功' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// 导出单例
const aiService = new AIService();

// 控制器
exports.getProviders = async (req, res) => {
  try {
    const providers = await aiService.getConfiguredProviders();
    res.json({ success: true, data: { providers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveProvider = async (req, res) => {
  try {
    const { providerKey, config } = req.body;
    const result = await aiService.saveProviderConfig(providerKey, config);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.addModel = async (req, res) => {
  try {
    const { providerKey, model } = req.body;
    const result = await aiService.addCustomModel(providerKey, model);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { providerKey, messages, options } = req.body;
    const result = await aiService.chat(providerKey, messages, options);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.testProvider = async (req, res) => {
  try {
    const { providerKey } = req.params;
    const result = await aiService.testConnection(providerKey);
    res.json({ success: result.success, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProviders: exports.getProviders,
  saveProvider: exports.saveProvider,
  addModel: exports.addModel,
  chat: exports.chat,
  testProvider: exports.testProvider,
  aiService
};
