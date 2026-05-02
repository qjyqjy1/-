<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title">观看广告赚积分</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body text-center py-4">
          <div v-if="!watched">
            <div class="mb-4">
              <i class="bi bi-play-circle text-success" style="font-size: 5rem"></i>
            </div>
            <h5>观看广告立得积分</h5>
            <p class="text-muted mb-4">每{{ cooldownSeconds / 60 }}分钟可观看一次，每次得{{ rewardPoints }}积分</p>
            
            <div v-if="adCode" class="ad-area mb-4" v-html="adCode"></div>
            <div v-else class="ad-placeholder mb-4">
              <small>广告加载中...</small>
            </div>
            
            <div class="progress mb-3" style="height: 10px">
              <div 
                class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
            <small class="text-muted">还剩 {{ countdown }} 秒</small>
            
            <button 
              v-if="canClaim"
              class="btn btn-success btn-lg w-100 mt-3"
              @click="claimReward"
            >
              领取 {{ rewardPoints }} 积分
            </button>
          </div>
          
          <div v-else>
            <div class="mb-4">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem"></i>
            </div>
            <h5 class="text-success">获得 {{ rewardPoints }} 积分！</h5>
            <p class="text-muted">{{ nextAvailableMessage }}</p>
          </div>
        </div>
        <div class="modal-footer border-0 justify-content-center">
          <button type="button" class="btn btn-secondary" @click="close">关闭</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '@/utils/api'

const emit = defineEmits(['close', 'reward'])

const adCode = ref('')
const rewardPoints = ref(10)
const cooldownSeconds = ref(60)
const countdown = ref(15)
const progress = ref(0)
const watched = ref(false)
const lastWatchTime = ref(null)
const timer = ref(null)

const canClaim = computed(() => countdown.value <= 0 && !watched.value)
const nextAvailableMessage = computed(() => {
  if (!lastWatchTime.value) return ''
  const nextTime = new Date(lastWatchTime.value.getTime() + cooldownSeconds.value * 1000)
  return `下次可观看时间：${nextTime.toLocaleTimeString()}`
})

onMounted(async () => {
  await loadAds()
  startCountdown()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

async function loadAds() {
  try {
    const res = await api.get('/api/ads?position=points_wall')
    if (res.data?.ads?.length > 0) {
      adCode.value = res.data.ads[0].jsCode
      rewardPoints.value = res.data.ads[0].pointsReward || 10
    }
  } catch (error) {
    console.error('加载广告失败:', error)
  }
}

function startCountdown() {
  timer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
      progress.value = ((15 - countdown.value) / 15) * 100
    }
  }, 1000)
}

async function claimReward() {
  try {
    const res = await api.post('/api/ads/view', {
      adId: adCode.value ? 1 : 1
    })
    
    watched.value = true
    lastWatchTime.value = new Date()
    emit('reward', res.data?.pointsEarned || rewardPoints.value)
  } catch (error) {
    alert(error.message || '领取失败')
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.ad-placeholder {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  padding: 30px;
  text-align: center;
  border-radius: 8px;
  min-height: 150px;
}
</style>
