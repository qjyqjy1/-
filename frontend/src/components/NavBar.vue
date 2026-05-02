<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        <span class="text-gradient">竞彩福彩</span> 方案分享
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/plans">方案列表</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/signin" v-if="isAuthenticated">每日签到</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center gap-3">
          <div class="points-display" v-if="isAuthenticated">
            <span class="badge bg-warning text-dark">
              <i class="bi bi-coins"></i> {{ user?.points || 0 }} 积分
            </span>
          </div>
          
          <template v-if="!isAuthenticated">
            <router-link class="btn btn-outline-light btn-sm" to="/login">登录</router-link>
            <router-link class="btn btn-primary btn-sm" to="/register">注册</router-link>
          </template>
          
          <template v-else>
            <router-link class="btn btn-outline-light btn-sm" to="/publish">发布方案</router-link>
            <div class="dropdown">
              <button class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                {{ user?.nickname || user?.username }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><router-link class="dropdown-item" to="/profile">个人中心</router-link></li>
                <li><router-link class="dropdown-item" to="/points">积分明细</router-link></li>
                <li><router-link class="dropdown-item" to="/favorites">我的收藏</router-link></li>
                <li v-if="isAdmin"><router-link class="dropdown-item" to="/admin">后台管理</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" @click="handleLogout">退出登录</button></li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navbar-brand {
  font-size: 1.3rem;
}

.points-display {
  margin-right: 10px;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-radius: 12px;
}

@media (max-width: 991px) {
  .navbar-collapse {
    background: rgba(0,0,0,0.2);
    padding: 15px;
    border-radius: 8px;
    margin-top: 10px;
  }
  
  .d-flex {
    flex-direction: column;
    gap: 10px !important;
  }
}
</style>
