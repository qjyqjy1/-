<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section bg-primary text-white py-5">
      <div class="container">
        <h1 class="display-4 fw-bold mb-3">赛事数据分析平台</h1>
        <p class="lead mb-4">专业赛事历史数据 + 走势分析参考</p>
        <div class="d-flex gap-3">
          <router-link to="/plans" class="btn btn-light btn-lg">浏览方案</router-link>
          <router-link to="/signin" class="btn btn-outline-light btn-lg">每日签到</router-link>
        </div>
      </div>
    </div>

    <!-- 开奖结果 -->
    <section class="py-4 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="mb-0"><i class="bi bi-trophy me-2"></i>昨日开奖</h3>
        </div>
        <div class="row g-3" v-if="latestResults.length > 0">
          <div class="col-md-4 col-lg" v-for="result in latestResults" :key="result.lotteryType">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span class="fw-bold">{{ getConfigName(result.lotteryType) }}</span>
                <span class="badge bg-secondary">{{ result.issueNumber }}</span>
              </div>
              <div class="card-body">
                <div class="balls d-flex flex-wrap gap-2 mb-2">
                  <span v-for="num in parseNumbers(result.winningNumbers)" :key="num"
                        class="ball" :class="getBallClass(num)">
                    {{ num }}
                  </span>
                  <span v-if="result.specialNumber" 
                        class="ball ball-special">{{ result.specialNumber }}</span>
                </div>
                <small class="text-muted">{{ formatDate(result.drawDate) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 今日竞彩赛程 -->
    <section class="py-4">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="mb-0"><i class="bi bi-calendar3 me-2"></i>今日赛程</h3>
          <div class="btn-group">
            <button class="btn btn-sm" :class="matchType === 'all' ? 'btn-primary' : 'btn-outline-primary'" @click="matchType = 'all'">全部</button>
            <button class="btn btn-sm" :class="matchType === 'jc_football' ? 'btn-primary' : 'btn-outline-primary'" @click="matchType = 'jc_football'">足球</button>
            <button class="btn btn-sm" :class="matchType === 'jc_basketball' ? 'btn-primary' : 'btn-outline-primary'" @click="matchType = 'jc_basketball'">篮球</button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="filteredMatches.length > 0" class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>时间</th><th>联赛</th><th>主队</th><th>比分</th><th>客队</th><th>数据</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="match in filteredMatches" :key="match.id">
                <td><span class="badge" :class="getStatusBadge(match.status)">{{ formatTime(match.matchTime) }}</span></td>
                <td>{{ match.league || '-' }}</td>
                <td class="fw-bold">{{ match.homeTeam }}</td>
                <td class="text-center">
                  <span v-if="match.homeScore !== null" class="fw-bold text-primary">{{ match.homeScore }}-{{ match.awayScore }}</span>
                  <span v-else class="text-muted">VS</span>
                </td>
                <td class="fw-bold">{{ match.awayTeam }}</td>
                <td><small v-if="match.oddsWin" class="text-muted">胜{{ match.oddsWin }} 平{{ match.oddsDraw }} 负{{ match.oddsLoss }}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 热门方案 -->
    <section class="py-4 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="mb-0"><i class="bi bi-fire me-2"></i>热门方案</h3>
          <router-link to="/plans" class="text-primary">查看全部 <i class="bi bi-chevron-right"></i></router-link>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-lg-3" v-for="plan in hotPlans" :key="plan.id">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ plan.title }}</h5>
                <p class="card-text text-muted small">{{ plan.content?.substring(0, 80) }}...</p>
              </div>
              <div class="card-footer bg-white border-0">
                <div class="d-flex justify-content-between">
                  <small class="text-muted"><i class="bi bi-eye"></i> {{ plan.viewCount }}</small>
                  <small class="text-muted"><i class="bi bi-unlock"></i> {{ plan.unlockCount }}</small>
                </div>
                <button class="btn btn-sm btn-primary w-100 mt-2" @click="$router.push(`/plan/${plan.id}`)">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import api from '@/utils/api'
export default {
  name: 'Home',
  data() {
    return {
      latestResults: [],
      todayMatches: [],
      hotPlans: [],
      matchType: 'all',
      loading: true,
      lotteryConfigs: []
    }
  },
  computed: {
    filteredMatches() {
      if (this.matchType === 'all') return this.todayMatches
      return this.todayMatches.filter(m => m.lotteryType === this.matchType)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [resultsRes, matchesRes, plansRes, configsRes] = await Promise.all([
          api.get('/lottery/results/latest'),
          api.get('/lottery/matches/today'),
          api.get('/plans?limit=8'),
          api.get('/lottery/configs')
        ])
        this.latestResults = resultsRes.data.data || []
        this.todayMatches = matchesRes.data.data || []
        this.hotPlans = plansRes.data.data?.plans || []
        this.lotteryConfigs = configsRes.data.data || []
      } catch (error) {
        console.error('加载失败:', error)
      } finally {
        this.loading = false
      }
    },
    getConfigName(type) {
      const config = this.lotteryConfigs.find(c => c.lotteryType === type)
      return config?.lotteryName || type
    },
    parseNumbers(str) {
      if (!str) return []
      return str.split(',').map(n => n.trim())
    },
    getBallClass(num) {
      const n = parseInt(num)
      return n <= 10 ? 'ball-red' : 'ball-blue'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },
    formatTime(date) {
      return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    },
    getStatusBadge(status) {
      return { scheduled: 'bg-secondary', playing: 'bg-success', finished: 'bg-primary', cancelled: 'bg-danger' }[status] || 'bg-secondary'
    }
  }
}
</script>

<style scoped>
.hero-section { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); }
.ball { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: white; }
.ball-red { background: #dc3545; }
.ball-blue { background: #0d6efd; }
.ball-special { background: #ffc107; color: #000; }
</style>
