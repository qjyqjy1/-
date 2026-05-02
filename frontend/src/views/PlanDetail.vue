<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-lg-8">
        <div class="card mb-4" v-if="plan">
          <div class="card-header bg-white border-0 py-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="badge bg-primary mb-2">{{ plan.lotteryType?.name }}</span>
                <h3 class="mb-0">{{ plan.title }}</h3>
              </div>
              <span class="badge bg-info">数据分析</span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="author-info mb-4 p-3 bg-light rounded">
              <div class="d-flex align-items-center">
                <img :src="plan.author?.avatar || 'https://via.placeholder.com/50'" class="rounded-circle me-3" width="50" height="50">
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ plan.author?.username }}</div>
                  <div class="text-muted small">Level {{ plan.author?.level || 1 }}</div>
                </div>
              </div>
              <div class="mt-3 d-flex gap-3 text-muted small">
                <span><i class="bi bi-calendar"></i> {{ formatDate(plan.publishedAt) }}</span>
                <span><i class="bi bi-eye"></i> {{ plan.viewCount }} 浏览</span>
                <span><i class="bi bi-unlock"></i> {{ plan.unlockCount }} 解锁</span>
                <span><i class="bi bi-hand-thumbs-up"></i> {{ plan.likeCount || 0 }} 点赞</span>
              </div>
            </div>
            
            <div class="plan-summary mb-4">
              <h5 class="fw-bold">方案摘要</h5>
              <p class="text-muted">{{ plan.content?.substring(0, 200) }}...</p>
            </div>
            
            <div v-if="plan.isUnlocked || plan.userId === user?.id" class="plan-content">
              <h5 class="fw-bold mb-3">完整内容</h5>
              <div class="content-body p-3 bg-light rounded">
                {{ plan.content }}
                <div v-if="plan.analysis" class="mt-3 pt-3 border-top">
                  <h6 class="fw-bold">数据分析</h6>
                  <p class="text-muted">{{ plan.analysis }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="locked-content text-center py-5">
              <div class="mb-3">
                <i class="bi bi-lock-fill text-primary" style="font-size: 4rem"></i>
              </div>
              <h5>完整方案需付费查看</h5>
              <p class="text-muted">解锁本方案需要 <strong class="text-danger">{{ plan.unlockPoints || 10 }}</strong> 积分</p>
              <p class="text-muted small">当前积分：<strong :class="user?.points >= (plan.unlockPoints || 10) ? 'text-success' : 'text-danger'">{{ user?.points || 0 }}</strong></p>
              
              <div v-if="user?.points >= (plan.unlockPoints || 10)" class="mt-4">
                <button class="btn btn-primary btn-lg" @click="unlockPlan">
                  <i class="bi bi-unlock"></i> 立即解锁
                </button>
              </div>
              <div v-else class="mt-4">
                <router-link to="/signin" class="btn btn-outline-primary me-2">去签到</router-link>
                <button class="btn btn-outline-success" @click="showAds = true">看广告赚积分</button>
              </div>
            </div>
            
            <div class="plan-actions mt-4 pt-4 border-top">
              <div class="d-flex gap-3">
                <button 
                  v-if="isAuthenticated"
                  class="btn"
                  :class="isLiked ? 'btn-primary' : 'btn-outline-primary'"
                  @click="toggleLike"
                >
                  <i :class="isLiked ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up'"></i>
                  {{ plan.likeCount || 0 }}
                </button>
                <button 
                  v-if="isAuthenticated"
                  class="btn"
                  :class="isCollected ? 'btn-warning' : 'btn-outline-warning'"
                  @click="toggleCollect"
                >
                  <i :class="isCollected ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'"></i>
                  {{ plan.favoriteCount || 0 }}
                </button>
                <button class="btn btn-outline-secondary" @click="sharePlan">
                  <i class="bi bi-share"></i> 分享
                </button>
              </div>
            </div>

            <div v-if="showAds" class="ads-modal" @click.self="showAds = false">
              <div class="ads-content">
                <button class="btn-close" @click="showAds = false"></button>
                <p>广告区域 - 点击赚积分</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card mb-3">
          <div class="card-header fw-bold">方案信息</div>
          <div class="card-body">
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><strong>联赛:</strong> {{ plan.league || '未指定' }}</li>
              <li class="mb-2"><strong>主队:</strong> {{ plan.homeTeam || '-' }}</li>
              <li class="mb-2"><strong>客队:</strong> {{ plan.awayTeam || '-' }}</li>
              <li class="mb-2"><strong>时间:</strong> {{ plan.matchTime ? formatDate(plan.matchTime) : '未指定' }}</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-header fw-bold">作者其他方案</div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li v-for="p in authorPlans" :key="p.id" class="list-group-item list-group-item-action" @click="$router.push(`/plan/${p.id}`)">
                {{ p.title }}
              </li>
              <li v-if="!authorPlans.length" class="list-group-item text-muted">暂无其他方案</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'
import { useAuthStore } from '@/store/auth'
import { computed } from 'vue'

export default {
  name: 'PlanDetail',
  data() {
    return {
      plan: null,
      loading: true,
      isLiked: false,
      isCollected: false,
      showAds: false,
      authorPlans: []
    }
  },
  computed: {
    authStore() { return useAuthStore() },
    isAuthenticated() { return !!this.authStore.token },
    user() { return this.authStore.user }
  },
  mounted() {
    this.loadPlan()
  },
  methods: {
    async loadPlan() {
      try {
        const res = await api.get(`/plans/${this.$route.params.id}`)
        this.plan = res.data.data
        if (this.isAuthenticated) {
          this.checkUserActions()
        }
        this.loadAuthorPlans()
      } catch (error) {
        alert('加载失败')
      } finally {
        this.loading = false
      }
    },
    async checkUserActions() {
      try {
        const res = await api.get(`/favorites/plan/${this.plan.id}/stats`)
        this.isLiked = res.data.data.liked
        this.isCollected = res.data.data.favorited
      } catch (error) {}
    },
    async loadAuthorPlans() {
      try {
        const res = await api.get(`/plans?userId=${this.plan.userId}&limit=5`)
        this.authorPlans = res.data.data?.plans?.filter(p => p.id !== this.plan.id) || []
      } catch (error) {}
    },
    async toggleLike() {
      if (!this.isAuthenticated) return this.$router.push('/login')
      try {
        await api.post('/favorites/like/toggle', { planId: this.plan.id })
        this.isLiked = !this.isLiked
        this.plan.likeCount = (this.plan.likeCount || 0) + (this.isLiked ? 1 : -1)
      } catch (error) {}
    },
    async toggleCollect() {
      if (!this.isAuthenticated) return this.$router.push('/login')
      try {
        const res = await api.post('/favorites/toggle', { planId: this.plan.id })
        this.isCollected = res.data.favorited
        this.plan.favoriteCount = (this.plan.favoriteCount || 0) + (this.isCollected ? 1 : -1)
      } catch (error) {}
    },
    async unlockPlan() {
      try {
        await api.post(`/plans/${this.plan.id}/unlock`)
        this.plan.isUnlocked = true
        alert('解锁成功')
      } catch (error) {
        alert(error.response?.data?.message || '解锁失败')
      }
    },
    sharePlan() {
      const url = window.location.href
      navigator.clipboard?.writeText(url)
      alert('链接已复制')
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.ads-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.ads-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  position: relative;
}
</style>
