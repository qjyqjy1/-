<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-piggy-bank me-2"></i>赛事数据平台
      </router-link>
      
      <button class="navbar-toggler" @click="collapsed = !collapsed"></button>
      
      <div class="collapse navbar-collapse" :class="{ show: !collapsed }">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/plans">方案广场</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/search">
              <i class="bi bi-search me-1"></i>搜索
            </router-link>
          </li>
        </ul>
        
        <ul class="navbar-nav">
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">登录</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">注册</router-link>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/signin">
                <i class="bi bi-calendar-check me-1"></i>签到
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/points">
                <i class="bi bi-coins me-1"></i>{{ userPoints }}
              </router-link>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" @click="showMenu = !showMenu">
                {{ username }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showMenu }">
                <li><router-link class="dropdown-item" to="/profile">个人中心</router-link></li>
                <li><router-link class="dropdown-item" to="/unlocked">已解锁方案</router-link></li>
                <li><router-link class="dropdown-item" to="/prizes">中奖记录</router-link></li>
                <li v-if="isAdmin"><router-link class="dropdown-item" to="/admin">管理后台</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" @click="logout">退出登录</a></li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import { computed } from 'vue'

export default {
  name: 'AppNavbar',
  data() {
    return {
      collapsed: true,
      showMenu: false
    }
  },
  setup() {
    const authStore = useAuthStore()
    return {
      isLoggedIn: computed(() => !!authStore.token),
      userPoints: computed(() => authStore.user?.points || 0),
      username: computed(() => authStore.user?.username || ''),
      isAdmin: computed(() => authStore.user?.role === 'admin'),
      logout: () => authStore.logout()
    }
  }
}
</script>
            <li class="nav-item">
              <router-link class="nav-link" to="/membership">
                <i class="bi bi-star me-1"></i>会员
              </router-link>
            </li>
