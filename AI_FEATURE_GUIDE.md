# AI 功能使用指南

## 功能概述

平台集成了 AI 智能助手功能，支持多种 AI 供应商，可用于赛事数据分析、走势解读等场景。

## 支持的 AI 供应商

### 1. OpenAI
- **模型**: GPT-4, GPT-3.5-Turbo, GPT-4-Turbo
- **配置项**: API Key, Base URL (可选), 默认模型
- **适用场景**: 通用对话、数据分析

### 2. Anthropic Claude
- **模型**: Claude-3-Opus, Claude-3-Sonnet, Claude-3-Haiku
- **配置项**: API Key
- **适用场景**: 长文本分析、逻辑推理

### 3. Azure OpenAI
- **模型**: GPT-4, GPT-35-Turbo
- **配置项**: API Key, Resource Name, Deployment Name
- **适用场景**: 企业级部署

### 4. 自定义供应商
- **模型**: 任意自定义模型
- **配置项**: API Key, Base URL, 模型列表
- **适用场景**: 阿里云通义、讯飞星火、百度文心等

## 配置步骤

### 1. 进入 AI 配置页面
- 登录管理后台
- 点击左侧菜单 "AI 配置"

### 2. 配置供应商
1. 选择供应商卡片（如 OpenAI）
2. 点击"配置"按钮
3. 填写 API Key
4. 选择默认模型
5. 可选：添加自定义模型、调整参数
6. 点击"保存配置"
7. 点击"测试连接"验证配置

### 3. 启用/禁用供应商
- 在供应商卡片右上角切换开关
- 启用的供应商会显示绿色边框

## 使用 AI 对话

### 方法一：管理后台 AI 对话
1. 进入管理后台
2. 点击 "AI 对话" 菜单
3. 选择供应商和模型
4. 点击"新建对话"
5. 输入消息，按 Ctrl+Enter 发送

### 方法二：API 调用
```javascript
// 调用 AI 对话 API
POST /api/ai/chat

请求体:
{
  "providerKey": "openai",
  "messages": [
    { "role": "user", "content": "分析这场比赛的数据" }
  ],
  "options": {
    "model": "gpt-4"
  }
}

响应:
{
  "success": true,
  "data": {
    "content": "AI 回复内容",
    "model": "gpt-4",
    "usage": { "prompt_tokens": 10, "completion_tokens": 50 },
    "provider": "openai"
  }
}
```

## 常见用途

### 1. 赛事数据分析
```
请分析这场足球比赛的历史交锋数据：
- 主队近 5 场：3 胜 1 平 1 负
- 客队近 5 场：2 胜 2 平 1 负
- 历史交锋：主队 3 胜 2 负
```

### 2. 走势解读
```
根据以下历史数据，分析走势特点：
- 大小球：近 10 场 7 大 3 小
- 让球：近 10 场 6 赢 4 输
```

### 3. 方案内容辅助
```
请帮我优化这个方案描述的表述，使其更专业：
"这场球主队状态不错，可能会赢"
```

## 自定义供应商配置示例

### 阿里云通义千问
```
供应商：custom
Base URL: https://dashscope.aliyuncs.com/api/v1
API Key: 阿里云 API Key
模型：qwen-turbo, qwen-plus, qwen-max
```

### 讯飞星火
```
供应商：custom
Base URL: https://spark-api-open.xf-yun.com/v1
API Key: 讯飞 API Key
模型：general, generalv2, generalv3
```

### 百度文心一言
```
供应商：custom
Base URL: https://aip.baidubce.com/rpc/2.0/ai_custom/v1
API Key: 百度 API Key
模型：ernie-bot, ernie-bot-turbo
```

## 安全注意事项

1. **API Key 保密**: 不要将配置导出或分享
2. **调用限制**: 建议设置每日调用上限
3. **内容审核**: AI 生成内容仅供参考，需人工审核
4. **费用控制**: 注意各供应商的计费标准

## 故障排查

### 连接失败
1. 检查 API Key 是否正确
2. 检查 Base URL 格式
3. 确认供应商已启用
4. 查看网络连通性

### 模型不可用
1. 确认模型名称正确
2. 检查供应商是否支持该模型
3. 尝试添加自定义模型

### 响应超时
1. 增加 timeout 配置（默认 30 秒）
2. 选择更快的模型
3. 减少消息长度

## 技术支持

如有问题，请查看后端日志或联系技术团队。
