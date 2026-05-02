<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-header bg-white border-0 py-3 text-center">
            <h4 class="mb-0 fw-bold text-gradient">用户注册</h4>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label">用户名</label>
                <input 
                  v-model="form.username"
                  type="text" 
                  class="form-control" 
                  placeholder="3-20 位字母、数字、下划线"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">手机号</label>
                <input 
                  v-model="form.phone"
                  type="tel" 
                  class="form-control" 
                  placeholder="用于找回密码"
                  pattern="1[3-9]\d{9}"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">密码</label>
                <input 
                  v-model="form.password"
                  type="password" 
                  class="form-control" 
                  placeholder="至少 6 位密码"
                  required
                  minlength="6"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">确认密码</label>
                <input 
                  v-model="form.confirmPassword"
                  type="password" 
                  class="form-control" 
                  placeholder="再次输入密码"
                  required
                >
              </div>
              <div v-if="error" class="alert alert-danger mb-3">
                {{ error }}
              </div>
              <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? '注册中...' : '注册' }}
              </button>
              <div class="text-center">
                <router-link to="/login" class="text-decoration-none">
                  已有账号？立即登录
                </router-link>
              </div>
            </form>
          </div>
          <div class="card-footer bg-white border-0 text-center pb-3">
            <small class="text-muted">
              注册即送 100 积分，可解锁 2 个方案
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const res = await api.post('/api/auth/register', {
      username: form.value.username,
      phone: form.value.phone,
      password: form.value.password
    })
    authStore.setAuth(res.data.token, res.data.user)
    router.push('/')
  } catch (err) {
    error.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
