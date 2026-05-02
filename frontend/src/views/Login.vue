<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-header bg-white border-0 py-3 text-center">
            <h4 class="mb-0 fw-bold text-gradient">用户登录</h4>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">账号</label>
                <input 
                  v-model="form.account"
                  type="text" 
                  class="form-control" 
                  placeholder="用户名/手机号/邮箱"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">密码</label>
                <input 
                  v-model="form.password"
                  type="password" 
                  class="form-control" 
                  placeholder="请输入密码"
                  required
                >
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="remember">
                <label class="form-check-label" for="remember">记住我</label>
              </div>
              <div v-if="error" class="alert alert-danger mb-3">
                {{ error }}
              </div>
              <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? '登录中...' : '登录' }}
              </button>
              <div class="text-center">
                <router-link to="/register" class="text-decoration-none">
                  还没有账号？立即注册
                </router-link>
              </div>
            </form>
          </div>
          <div class="card-footer bg-white border-0 text-center pb-3">
            <small class="text-muted">
              登录后即可赚积分、看方案、发方案
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/utils/api'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  account: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  
  try {
    const res = await api.post('/auth/login', form.value)
    authStore.setAuth(res.data.token, res.data.user)
    
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script>
