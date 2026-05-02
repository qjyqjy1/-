const axios = require('axios');
const SystemConfig = require('../models/SystemConfig');
const AIChatHistory = require('../models/AIChatHistory');

class AIAnalyst {
  async analyze(data) {
    const prompt = this.buildPrompt(data);
    const response = await this.callLLM(prompt);
    return this.parseAnalysis(response);
  }

  buildPrompt(data) {
    return `你是一名专业的赛事数据分析师，请根据提供的数据生成分析报告：

数据:
- 历史战绩：${data.history || '无'}
- 近期表现：${data.recent || '无'}
- 主客场：${data.homeAway || '无'}

要求:
1. 客观中立
2. 数据驱动
3. 避免绝对化表述
4. 不包含预测性内容

格式要求:
- 趋势分析
- 数据对比
- 关键指标`
  }

  async callLLM(prompt) {
    const config = await SystemConfig.findOne({
      where: { configKey: 'ai_anthropic' }
    })

    if (!config) throw new Error('AI 未配置')

    const settings = JSON.parse(config.configValue)
    
    try {
      const response = await axios.post(
        `${settings.baseUrl || 'https://api.anthropic.com/v1'}/messages`,
        {
          model: settings.defaultModel || 'claude-3-haiku',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 30000
        }
      )
      return response.data.content[0].text
    } catch (error) {
      throw new Error('AI 调用失败：' + error.message)
    }
  }

  parseAnalysis(text) {
    return {
      trend: text.split('\n')[0] || '',
      comparison: text.split('\n')[1] || '',
      metrics: text.split('\n')[2] || '',
      fullText: text
    }
  }
}

const analyst = new AIAnalyst()

exports.analyze = async (req, res) => {
  try {
    const { history, recent, homeAway } = req.body
    const result = await analyst.analyze({ history, recent, homeAway })
    
    // 记录到历史
    if (req.user) {
      await AIChatHistory.create({
        userId: req.user.id,
        sessionId: req.body.sessionId || 'default',
        message: JSON.stringify({ history, recent, homeAway }),
        response: result.fullText
      })
    }
    
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body
    const userId = req.user.id

    // 知识库检索（简化版）
    const context = `用户问：${message}`
    
    const response = await analyst.callLLM(
      `回答用户问题，保持专业和数据驱动：${context}`
    )

    await AIChatHistory.create({
      userId,
      sessionId: sessionId || 'chat',
      message,
      response
    })

    res.json({ success: true, data: { response } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.history = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const result = await AIChatHistory.findAndCountAll({
      where: { userId: req.user.id },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: { total: result.count, history: result.rows }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
