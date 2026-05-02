/**
 * SEO 优化脚本
 * 功能：自动生成 TDK、sitemap、静态化
 */

class SEOGenerator {
  constructor() {
    this.baseUrl = 'https://your-domain.com';
    this.sitemapPath = '/sitemap.xml';
  }

  // 生成页面 TDK
  generateTDK(pageType, data = {}) {
    const siteName = '竞彩福彩赛事数据分享平台';
    const siteDesc = '专业体育赛事数据整理与资讯参考平台，提供英超、NBA、福彩、体彩等赛事的历史数据分析与技术统计。';
    
    let title = siteName;
    let description = siteDesc;
    let keywords = '赛事数据，历史分析，技术统计，体育资讯';

    switch (pageType) {
      case 'plan_detail':
        // 方案详情页
        const { planTitle, lotteryType, summary } = data;
        title = `${planTitle} - ${lotteryType}数据分析 - ${siteName}`;
        description = `${summary || planTitle}。${siteDesc}`;
        keywords = `${lotteryType}, ${planTitle}, 赛事数据，历史分析`;
        break;

      case 'lottery_list':
        // 彩种列表页
        const { lotteryName } = data;
        title = `${lotteryName}数据分析 - 历史走势参考 - ${siteName}`;
        description = `提供${lotteryName}历史开奖数据整理，包含走势分析、冷热号统计、遗漏值等技术指标参考。`;
        keywords = `${lotteryName}, 历史数据，走势分析，开奖统计`;
        break;

      case 'ranking':
        // 排行榜页
        title = `热门数据分析方案排行榜 - ${siteName}`;
        description = '平台热门赛事数据分析方案排行，包含解锁次数最多、浏览最多、收藏最多的优质方案。';
        keywords = '方案排行榜，热门方案，优质数据';
        break;

      case 'user_profile':
        // 用户主页
        const { username } = data;
        title = `${username}的数据分析方案 - ${siteName}`;
        description = `查看${username}发布的所有赛事数据分析方案。`;
        keywords = `${username}, 数据分析师，方案合集`;
        break;
    }

    // 更新页面 meta
    this.updateMetaTags(title, description, keywords);
    
    return { title, description, keywords };
  }

  // 更新页面 meta 标签
  updateMetaTags(title, description, keywords) {
    // title
    document.title = title;
    
    let titleEl = document.querySelector('meta[name="title"]');
    if (!titleEl) {
      titleEl = document.createElement('meta');
      titleEl.name = 'title';
      document.head.appendChild(titleEl);
    }
    titleEl.content = title;

    // description
    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.name = 'description';
      document.head.appendChild(descEl);
    }
    descEl.content = description;

    // keywords
    let keywordsEl = document.querySelector('meta[name="keywords"]');
    if (!keywordsEl) {
      keywordsEl = document.createElement('meta');
      keywordsEl.name = 'keywords';
      document.head.appendChild(keywordsEl);
    }
    keywordsEl.content = keywords;

    // Open Graph
    this.updateOpenGraph(title, description);
  }

  // 更新 Open Graph 标签
  updateOpenGraph(title, description) {
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:site_name': '竞彩福彩赛事数据分享平台'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    });
  }

  // 生成 URL
  generateURL(type, data) {
    switch (type) {
      case 'plan_detail':
        return `${this.baseUrl}/plan/${data.id}`;
      case 'lottery_list':
        return `${this.baseUrl}/plans?type=${data.code}`;
      case 'ranking':
        return `${this.baseUrl}/ranking`;
      default:
        return this.baseUrl;
    }
  }

  // 生成结构化数据（JSON-LD）
  generateStructuredData(type, data) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': data.title,
      'description': data.summary,
      'author': {
        '@type': 'Person',
        'name': data.authorName
      },
      'datePublished': data.publishedAt,
      'dateModified': data.updatedAt
    };

    // 插入到页面
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  // 生成 sitemap.xml（后端调用）
  async generateSitemap(plans) {
    const urlset = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${this.baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${this.baseUrl}/plans</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${this.baseUrl}/ranking</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${plans.map(plan => `  <url>
    <loc>${this.baseUrl}/plan/${plan.id}</loc>
    <lastmod>${plan.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

    // 在实际项目中，这里应该写入到文件
    // await fs.writeFileSync('./public/sitemap.xml', urlset);
    console.log('Sitemap 生成成功，包含', plans.length, '个方案页面');
    return urlset;
  }

  // 生成 robots.txt
  generateRobotsTxt() {
    return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /profile
Disallow: /points
Sitemap: ${this.baseUrl}/sitemap.xml`;
  }

  // 页面预渲染（静态化）
  async prerenderPage(url) {
    // 在实际项目中，这里应该调用无头浏览器进行预渲染
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto(url, { waitUntil: 'networkidle2' });
    // const html = await page.content();
    // await fs.writeFileSync(`./dist/${url}.html`, html);
    
    console.log('页面预渲染:', url);
  }

  // 批量静态化列表页
  async staticizeListPages() {
    const pages = [
      '/plans',
      '/plans?type=football',
      '/plans?type=basketball',
      '/plans?type=lottery',
      '/ranking'
    ];

    for (const page of pages) {
      await this.prerenderPage(page);
    }

    console.log('列表页静态化完成');
  }
}

// 全局实例
window.seoGenerator = new SEOGenerator();

// 自动为页面生成 TDK
document.addEventListener('DOMContentLoaded', function() {
  // 检测当前页面类型并生成对应 TDK
  const path = window.location.pathname;
  
  if (path.startsWith('/plan/')) {
    // 方案详情页
    const planData = {
      id: path.split('/')[2],
      planTitle: document.querySelector('h3')?.textContent || '赛事数据分析',
      lotteryType: document.querySelector('.badge')?.textContent || '赛事数据',
      summary: document.querySelector('.text-muted')?.textContent || ''
    };
    window.seoGenerator.generateTDK('plan_detail', planData);
  } else if (path === '/plans') {
    // 列表页
    window.seoGenerator.generateTDK('lottery_list', { lotteryName: '全部方案' });
  } else if (path === '/ranking') {
    // 排行榜
    window.seoGenerator.generateTDK('ranking');
  }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOGenerator;
}
