<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-lg-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">每日签到</h5>
            <p class="text-muted">每天签到领积分</p>
            <div class="display-4 text-primary mb-3">+{{ signinPoints }}</div>
            <button 
              class="btn btn-primary w-100" 
              @click="doSignin"
              :disabled="hasSignedIn || signing"
            >
              {{ hasSignedIn ? '今日已签到' : (signing ? '签到中...' : '立即签到') }}
            </button>
            <div v-if="hasSignedIn" class="mt-2 text-success">
              <small>下次签到：明天</small>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card text-center border-warning">
          <div class="card-body">
            <h5 class="card-title">看广告赚积分</h5>
            <p class="text-muted">观看广告领积分</p>
            <div class="display-4 text-success mb-3">+{{ adPoints }}</div>
            <button class="btn btn-success w-100" @click="showAds = true">
              观看广告
            </button>
            <small class="text-muted d-block mt-2">每 60 秒可观看一次</small>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">我的积分</h5>
            <p class="text-muted">当前积分余额</p>
            <div class="display-4 text-warning mb-3">{{ user?.points || 0 }}</div>
            <router-link to="/points" class="btn btn-outline-primary w-100">
              积分明细
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card mt-4">
      <div class="card-header bg-white border-0 py-3">
        <h5 class="mb-0 fw-bold">签到日历</h5>
      </div>
      <div class="card-body">
        <div class="row text-center">
          <div 
            v-for="day in 7" 
            :key="day"
            class="col"
          >
            <div class="p-3" :class="isDaySignedIn(day) ? 'bg-success text-white' : 'bg-light'">
              <div class="mb-2">
                <i v-if="isDaySignedIn(day)" class="bi bi-check-circle-fill"></i>
                <span v-else>{{ getDayName(day) }}</span>
              </div>
              <small>{{ getDayDate(day) }}</small>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center">
          <p>连续签到 <strong class="text-primary">{{ consecutiveDays }}</strong> 天</p>
          <p v-if="consecutiveDays > 0" class="text-muted small">
            每连续签到 7 天额外奖励 +{{ continuousBonus }} 积分
          </p>
        </div>
      </div>
    </div>
    
    <div class="card mt-4">
      <div class="card-header bg-white border-0 py-3">
        <h5 class="mb-0 fw-bold">最近签到记录</h5>
      </div>
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>日期</th>
              <th>获得积分</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.signinDate }}</td>
              <td class="text-success">+{{ record.pointsEarned }}</td>
              <td>
                <span v-if="record.pointsEarned > signinPoints" class="badge bg-warning">
                  含连续签到奖励
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <AdModal v-if="showAds" @close="showAds = false" @reward="handleAdReward" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { useAuthStore } from '@/store/auth'
import AdModal from '@/components/AdModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const hasSignedIn = ref(false)
const signing = ref(false)
const signinPoints = ref(20)
const adPoints = ref(10)
const continuousBonus = ref(5)
const consecutiveDays = ref(0)
const records = ref([])
const showAds = ref(false)

onMounted(async () => {
  await loadStatus()
  await loadRecords()
})

async function loadStatus() {
  try {
    const res = await api.get('/signin/status')
    hasSignedIn.value = res.data?.hasSigninToday
    consecutiveDays.value = res.data?.consecutiveDays || 0
  } catch (error) {
    console.error('加载签到状态失败:', error)
  }
}

async function loadRecords() {
  try {
    const res = await api.get('/signin/records?limit=10')
    records.value = res.data?.records || []
  } catch (error) {
    console.error('加载记录失败:', error)
  }
}

async function doSignin() {
  signing.value = true
  try {
    const res = await api.post('/signin')
    alert(`签到成功！获得${res.data.pointsEarned}积分`)
    hasSignedIn.value = true
    consecutiveDays.value = res.data.consecutiveDays
    if (authStore.user) {
      authStore.user.points = res.data.newBalance
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (error) {
    alert(error.message || '签到失败')
  } finally {
    signing.value = false
  }
}

function handleAdReward(points) {
  if (authStore.user) {
    authStore.user.points = (authStore.user.points || 0) + points
    localStorage.setItem('user', JSON.stringify(authStore.user))
  }
}

function isDaySignedIn(day) {
  const date = new Date()
  date.setDate(date.getDate() - (day - 1))
  const dateStr = date.toISOString().split('T')[0]
  return records.value.some(r => r.signinDate === dateStr)
}

function getDayName(day) {
  const days = ['今天', '昨天', '前天', '大前天', '', '', '']
  return days[day - 1] || `${day - 1}天前`
}

function getDayDate(day) {
  const date = new Date()
  date.setDate(date.getDate() - (day - 1))
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>
