const axios = require('axios');
const BettingPlan = require('../models/BettingPlan');
const SystemConfig = require('../models/SystemConfig');
const { filterContent } = require('../middleware/sensitiveFilter');

class AIGenerateService {
  async getConfiguredProvider() {
    const configs = await SystemConfig.findAll({
      where: { configKey: { [require('sequelize').Op.startsWith]: 'ai_' } }
    });

    for (const config of configs) {
      const settings = JSON.parse(config.configValue);
      if (settings.enabled && settings.apiKey) {
        return { key: config.configKey.replace('ai_', ''), settings };
      }
    }
    return null;
  }

  async generatePlan(data) {
    const provider = await this.getConfiguredProvider();
    if (!provider) {
      throw new Error('未配置可用的 AI 供应商');
    }

    const prompt = this.buildPrompt(data);
    
    let response;
    if (provider.key === 'openai' || provider.key === 'custom') {
      response = await this.callOpenAI(provider.settings, prompt);
    } else if (provider.key === 'anthropic') {
      response = await this.callAnthropic(provider.settings, prompt);
    } else if (provider.key === 'azure') {
      response = await this.callAzure(provider.settings, prompt);
    }

    const parsed = this.parseAIResponse(response);
    
    return {
      title: parsed.title || this.generateTitle(data),
      content: parsed.content,
      analysis: parsed.analysis,
      tags: parsed.tags || []
    };
  }

  buildPrompt(data) {
    return `你是一个专业的赛事数据分析师，请根据以下信息生成一份赛事数据分析报告：

比赛信息:
- 联赛：${data.league || '未指定'}
- 主队：${data.homeTeam || '未指定'}
- 客队：${data.awayTeam || '未指定'}
- 比赛时间：${data.matchTime || '未指定'}

历史数据:
- 主队近况：${data.homeForm || '无数据'}
- 客队近况：${data.awayForm || '无数据'}
- 历史交锋：${data.h2h || '无数据'}

要求:
1. 客观分析双方实力对比
2. 分析历史交锋数据特点
3. 指出关键数据指标
4. 用词专业中性，避免绝对化表述
5. 不包含"预测、必中、赔率"等敏感词

请按照以下格式输出:
标题：[简洁的标题]
内容：[详细的分析内容，300-500 字]
分析：[核心数据总结，100-200 字]
标签：[标签 1, 标签 2, 标签 3]
`;
  }

  async callOpenAI(settings, prompt) {
    const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: settings.defaultModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        timeout: 30000
      }
    );
    return response.data.choices[0].message.content;
  }

  async callAnthropic(settings, prompt) {
    const response = await axios.post(
      `${settings.baseUrl || 'https://api.anthropic.com/v1'}/messages`,
      {
        model: settings.defaultModel || 'claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
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
    return response.data.content[0].text;
  }

  async callAzure(settings, prompt) {
    const deployment = settings.defaultModel?.replace('.', '') || 'gpt4';
    const baseUrl = settings.baseUrl
      .replace('{resource}', settings.resource)
      .replace('{deployment}', deployment);
    
    const response = await axios.post(
      `${baseUrl}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': settings.apiKey
        },
        timeout: 30000
      }
    );
    return response.data.choices[0].message.content;
  }

  parseAIResponse(text) {
    const result = { title: '', content: '', analysis: '', tags: [] };
    
    const titleMatch = text.match(/标题 [:：]\s*(.+)/);
    if (titleMatch) result.title = titleMatch[1].trim();
    
    const contentMatch = text.match(/内容 [:：]\s*([\s\S]*?)(?=分析 | 标签|$)/);
    if (contentMatch) result.content = contentMatch[1].trim();
    
    const analysisMatch = text.match(/分析 [:：]\s*([\s\S]*?)(?=标签|$)/);
    if (analysisMatch) result.analysis = analysisMatch[1].trim();
    
    const tagsMatch = text.match(/标签 [:：]\s*\[?([^\]]+)\]?/);
    if (tagsMatch) {
      result.tags = tagsMatch[1].split(',').map(t => t.trim()).filter(t => t);
    }

    if (!result.content) {
      result.content = text;
    }

    return result;
  }

  generateTitle(data) {
    const parts = [];
    if (data.league) parts.push(data.league);
    if (data.homeTeam) parts.push(data.homeTeam);
    if (data.awayTeam) parts.push('vs' + data.awayTeam);
    return parts.join(' ') + ' 赛事数据分析';
  }
}

const aiGenerateService = new AIGenerateService();

exports.generate = async (req, res) => {
  try {
    const { league, homeTeam, awayTeam, matchTime, homeForm, awayForm, h2h } = req.body;
    
    const generated = await aiGenerateService.generatePlan({
      league, homeTeam, awayTeam, matchTime, homeForm, awayForm, h2h
    });

    const filtered = {
      title: filterContent(generated.title),
      content: filterContent(generated.content),
      analysis: filterContent(generated.analysis)
    };

    res.json({
      success: true,
      data: {
        title: filtered.title.filtered,
        content: filtered.content.filtered,
        analysis: filtered.analysis.filtered,
        tags: generated.tags
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.autoPublish = async (req, res) => {
  try {
    const { league, homeTeam, awayTeam, matchTime, homeForm, awayForm, h2h, unlockPoints } = req.body;
    const userId = req.user.id;

    const generated = await aiGenerateService.generatePlan({
      league, homeTeam, awayTeam, matchTime, homeForm, awayForm, h2h
    });

    const plan = await BettingPlan.create({
      userId,
      title: generated.title,
      content: generated.content,
      analysis: generated.analysis,
      league: league || '',
      homeTeam: homeTeam || '',
      awayTeam: awayTeam || '',
      matchTime: matchTime ? new Date(matchTime) : null,
      unlockPoints: unlockPoints || 10,
      status: 'published',
      publishedAt: new Date()
    });

    res.json({
      success: true,
      data: plan,
      message: 'AI 生成并发布成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
