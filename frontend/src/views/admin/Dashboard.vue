<template>
  <div class="admin-page">
    <nav class="navbar navbar-dark bg-dark mb-4">
      <div class="container">
        <span class="navbar-brand">后台管理系统</span>
        <div>
          <router-link to="/admin/ai-chat" class="btn btn-outline-light btn-sm me-2">
            <i class="bi bi-chat-dots me-1"></i>AI 对话
          </router-link>
          <router-link to="/admin/ai-config" class="btn btn-outline-light btn-sm me-2">
            <i class="bi bi-robot me-1"></i>AI 配置
          </router-link>
          <button class="btn btn-outline-light btn-sm" @click="$router.push('/')">返回前台</button>
        </div>
      </div>
    </nav>
    
    <div class="container">
      <div class="row">
        <div class="col-lg-2">
          <div class="nav flex-column nav-pills">
            <button class="nav-link text-start" :class="{ active: tab === 'plans' }" @click="tab = 'plans'">
              方案管理
            </button>
            <button class="nav-link text-start" :class="{ active: tab === 'users' }" @click="tab = 'users'">
              用户管理
            </button>
            <button class="nav-link text-start" :class="{ active: tab === 'ads' }" @click="tab = 'ads'">
              广告管理
            </button>
            <button class="nav-link text-start" :class="{ active: tab === 'publish' }" @click="tab = 'publish'">
              <i class="bi bi-journal-plus me-2"></i>方案发布
            </button>
            <button class="nav-link text-start" :class="{ active: tab === 'lottery' }" @click="tab = 'lottery'">
        <router-link to="/membership" class="btn btn-sm btn-outline-primary mt-2 mb-2"><i class="bi bi-star me-1"></i>会员中心</router-link>
        <router-link to="/analytics" class="btn btn-sm btn-outline-success mt-2 mb-2"><i class="bi bi-graph-up me-1"></i>数据可视化</router-link>
        <router-link to="/ai-analyst" class="btn btn-sm btn-outline-info mt-2 mb-2"><i class="bi bi-robot me-1"></i>AI 分析师</router-link>
              <i class="bi bi-bar-chart me-2"></i> 彩票数据
            </button>
            <button class="nav-link text-start" :class="{ active: tab === 'config' }" @click="tab = 'config'">
              系统配置
            </button>
          </div>
        </div>
        
        <div class="col-lg-10">
          <div v-if="tab === 'plans'" class="card">
            <div class="card-header"><h5 class="mb-0">方案审核</h5></div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0">
                <thead><tr><th>ID</th><th>标题</th><th>作者</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="plan in plans" :key="plan.id">
                    <td>{{ plan.id }}</td><td>{{ plan.title }}</td><td>{{ plan.author?.username }}</td>
                    <td><span class="badge" :class="getStatusBadge(plan.status)">{{ getStatusText(plan.status) }}</span></td>
                    <td>{{ formatDate(plan.publishedAt) }}</td>
                    <td>
                      <button class="btn btn-sm btn-success" @click="reviewPlan(plan.id, 'published')">通过</button>
                      <button class="btn btn-sm btn-danger" @click="reviewPlan(plan.id, 'rejected')">拒绝</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="tab === 'users'" class="card">
            <div class="card-header"><h5 class="mb-0">用户管理</h5></div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0">
                <thead><tr><th>ID</th><th>用户名</th><th>手机</th><th>积分</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td><td>{{ user.username }}</td><td>{{ user.phone }}</td>
                    <td>{{ user.points }}</td>
                    <td><span class="badge" :class="user.status === 'active' ? 'bg-success' : 'bg-secondary'">{{ user.status === 'active' ? '正常' : '禁用' }}</span></td>
                    <td><button class="btn btn-sm btn-danger" @click="toggleUserStatus(user)">{{ user.status === 'active' ? '禁用' : '启用' }}</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-if="tab === 'ads'" class="card">
            <div class="card-header"><h5 class="mb-0">广告管理</h5></div>
            <div class="card-body"><p>广告配置功能</p></div>
          </div>

          <div v-if="tab === 'lottery'" class="card">
            <div class="card-header"><h5 class="mb-0">彩票数据管理</h5></div>
            <div class="card-body">
              <LotteryData />
            </div>
          </div>
          
          <div v-if="tab === 'config'" class="card">
            <div class="card-header"><h5 class="mb-0">系统配置</h5></div>
            <div class="card-body"><p>系统配置功能</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'
import LotteryData from './LotteryData.vue'

export default {
  name: 'AdminDashboard',
  components: { LotteryData },
  data() {
    return {
      tab: 'plans',
      plans: [],
      users: [],
      stats: {}
    }
  },
  mounted() {
    this.loadPlans()
    this.loadUsers()
    this.loadStats()
  },
  methods: {
    async loadPlans() {
      const res = await api.get('/admin/plans/pending')
      this.plans = res.data.data || []
    },
    async loadUsers() {
      const res = await api.get('/admin/users')
      this.users = res.data.data || []
    },
    async loadStats() {
      const res = await api.get('/stats')
      this.stats = res.data.data || {}
    },
    async reviewPlan(id, status) {
      await api.post(`/admin/plans/${id}/review`, { status })
      this.loadPlans()
    },
    async toggleUserStatus(user) {
      const newStatus = user.status === 'active' ? 'banned' : 'active'
      await api.put(`/admin/users/${user.id}`, { status: newStatus })
      this.loadUsers()
    },
    getStatusBadge(status) {
      return { pending: 'bg-warning', published: 'bg-success', rejected: 'bg-danger' }[status] || 'bg-secondary'
    },
    getStatusText(status) {
      return { pending: '待审核', published: '已发布', rejected: '已拒绝' }[status] || status
    },
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.admin-page { min-height: 100vh; background: #f8f9fa; }
.nav-pills .nav-link { color: #495057; margin-bottom: 0.5rem; }
.nav-pills .nav-link.active { background-color: #0d6efd; }
</style>
