<template>
  <div class="user-unlocked-page">
    <div class="container py-4">
      <h2 class="mb-4"><i class="bi bi-unlock me-2"></i>已解锁方案</h2>

      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item">
          <button class="nav-link active" @click="tab = 'unlocked'">已解锁方案</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" @click="tab = 'prizes'">中奖记录</button>
        </li>
      </ul>

      <!-- 已解锁方案 -->
      <div v-if="tab === 'unlocked'">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="unlockedPlans.length > 0" class="row g-4">
          <div class="col-md-6 col-lg-4" v-for="plan in unlockedPlans" :key="plan.id">
            <div class="card h-100" :class="getWinnerClass(plan)">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span class="badge bg-primary">{{ plan.lotteryType }}</span>
                <span v-if="plan.isWinner !== null" class="badge" :class="plan.isWinner ? 'bg-success' : 'bg-danger'">
                  {{ plan.isWinner ? '✅ 中奖' : '未中' }}
                </span>
                <span v-else class="badge bg-secondary">待开奖</span>
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ plan.title }}</h5>
                <p class="card-text text-muted small">{{ plan.content?.substring(0, 100) }}...</p>
                <div class="mb-2">
                  <small class="text-muted">解锁：{{ plan.unlockedAt ? formatDate(plan.unlockedAt) : '-' }}</small>
                </div>
                <div v-if="plan.isWinner" class="alert alert-success py-2 mb-0">
                  <i class="bi bi-trophy me-1"></i>参考奖金：¥{{ plan.prizeAmount }}
                </div>
                <div v-else-if="plan.isWinner === false" class="alert alert-secondary py-2 mb-0">
                  <i class="bi bi-emoji-frown me-1"></i>继续加油
                </div>
              </div>
              <div class="card-footer bg-white border-0">
                <button class="btn btn-sm btn-primary w-100" @click="$router.push(`/plan/${plan.id}`)">
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-1"></i>
          <p class="mt-3">暂无已解锁方案</p>
          <router-link to="/plans" class="btn btn-primary">去浏览方案</router-link>
        </div>
      </div>

      <!-- 中奖记录 -->
      <div v-if="tab === 'prizes'">
        <div v-if="prizes.length > 0" class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>中奖时间</th>
                <th>彩种</th>
                <th>期号</th>
                <th>方案内容</th>
                <th>奖级</th>
                <th>参考奖金</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prize in prizes" :key="prize.id">
                <td>{{ formatDate(prize.createdAt) }}</td>
                <td>{{ prize.lotteryType.toUpperCase() }}</td>
                <td>{{ prize.issueNumber }}</td>
                <td>{{ prize.planContent?.substring(0, 50) }}...</td>
                <td>{{ prize.prizeLevel || '普奖' }}</td>
                <td class="text-success fw-bold">¥{{ prize.prizeAmount }}</td>
                <td>
                  <span class="badge bg-success">{{ getPrizeStatusText(prize.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center text-muted py-5">
          <i class="bi bi-emoji-frown fs-1"></i>
          <p class="mt-3">暂无中奖记录</p>
        </div>
      </div>

      <div class="alert alert-info mt-4">
        <i class="bi bi-info-circle me-2"></i>
        <strong>温馨提示：</strong>中奖奖金仅供参考，实际奖金以官方公布为准。本平台不涉及真实货币交易。
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'UserUnlocked',
  data() {
    return {
      tab: 'unlocked',
      unlockedPlans: [],
      prizes: [],
      loading: true
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [plansRes, prizesRes] = await Promise.all([
          api.get('/user-unlocked/my-unlocked'),
          api.get('/user-unlocked/my-prizes')
        ])
        this.unlockedPlans = plansRes.data.data || []
        this.prizes = prizesRes.data.data || []
      } catch (error) {
        console.error('加载失败:', error)
      } finally {
        this.loading = false
      }
    },
    getWinnerClass(plan) {
      if (plan.isWinner) return 'border-success'
      if (plan.isWinner === false) return 'border-secondary'
      return ''
    },
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN')
    },
    getPrizeStatusText(status) {
      return '已记录'
    }
  }
}
</script>

<style scoped>
.card.border-success { border-color: #198754 !important; background: #f8fff9; }
.card.border-secondary { border-color: #6c757d !important; background: #f8f9fa; }
</style>
