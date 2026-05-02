// 敏感词过滤中间件

const sensitiveWords = [
  // 预测类
  '预测', '预知', '预判', '预言', '卜卦', '算命',
  '必中', '稳中', '保证中', '100%', '百分百', '绝对',
  '推荐', '荐号', '荐彩', '心水', '内幕', '料子',
  
  // 赔率类
  '赔率', '水位', '盘口', '让球', '盘路', '指数',
  ' odds', 'sp 值', '返还率', '凯利指数',
  
  // 中奖类
  '中奖', '赢钱', '盈利', '收益', '回报', '利润率',
  '收米', '红单', '黑单', '稳单', '胆码',
  
  // 其他违规词
  '代买', '代购', '合买', '拼单', '跟投', '跟单',
  '导师', '带队', '计划群', 'VIP 群', '内部消息'
];

const replacementMap = {
  '预测': '分析',
  '预知': '预估',
  '必中': '有望',
  '稳中': '稳定',
  '推荐': '参考',
  '赔率': '数据',
  '中奖': '结果',
  '赢钱': '获得',
  '推荐': '建议'
};

// 检测是否包含敏感词
function containsSensitive(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  for (const word of sensitiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// 获取敏感词列表
function getSensitiveWords(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = [];
  for (const word of sensitiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      found.push(word);
    }
  }
  return found;
}

// 替换敏感词
function replaceSensitive(text) {
  if (!text) return text;
  let result = text;
  for (const [sensitive, replacement] of Object.entries(replacementMap)) {
    const regex = new RegExp(sensitive, 'gi');
    result = result.replace(regex, replacement);
  }
  return result;
}

// 过滤内容（检测 + 替换）
function filterContent(content) {
  const sensitiveWords = getSensitiveWords(content);
  const filtered = replaceSensitive(content);
  return {
    original: content,
    filtered,
    hasSensitive: sensitiveWords.length > 0,
    sensitiveWords
  };
}

// Express 中间件
function sensitiveFilter(req, res, next) {
  const fieldsToCheck = ['title', 'content', 'description', 'analysis'];
  const results = {};
  
  for (const field of fieldsToCheck) {
    if (req.body[field]) {
      results[field] = filterContent(req.body[field]);
    }
  }
  
  // 如果有敏感词，可以选择拒绝或自动替换
  const hasSensitive = Object.values(results).some(r => r?.hasSensitive);
  
  if (hasSensitive) {
    // 自动替换敏感词
    for (const [field, result] of Object.entries(results)) {
      if (result?.hasSensitive) {
        req.body[field] = result.filtered;
      }
    }
    
    // 返回警告信息
    const allSensitiveWords = Object.values(results)
      .flatMap(r => r?.sensitiveWords || [])
      .filter((v, i, a) => a.indexOf(v) === i);
    
    res.setHeader('X-Sensitive-Words', JSON.stringify(allSensitiveWords));
  }
  
  next();
}

module.exports = {
  containsSensitive,
  getSensitiveWords,
  replaceSensitive,
  filterContent,
  sensitiveFilter,
  sensitiveWords
};
