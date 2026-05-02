<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header bg-white border-0 py-3">
            <h4 class="mb-0 fw-bold">发布投注方案</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">彩种 <span class="text-danger">*</span></label>
                <select v-model="form.lotteryTypeId" class="form-select" required>
                  <option value="">请选择彩种</option>
                  <option v-for="type in lotteryTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">方案标题 <span class="text-danger">*</span></label>
                <input v-model="form.title" type="text" class="form-control" required maxlength="200" placeholder="简明扼要的标题，突出亮点">
                <div class="form-text">{{ form.title.length }}/200</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">方案摘要</label>
                <textarea v-model="form.summary" class="form-control" rows="2" maxlength="500" placeholder="简要描述方案特点"></textarea>
                <div class="form-text">{{ form.summary.length }}/500</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">赛事信息</label>
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <input v-model="form.matchInfo.home" type="text" class="form-control" placeholder="主队名称">
                  </div>
                  <div class="col-md-6 mb-2">
                    <input v-model="form.matchInfo.away" type="text" class="form-control" placeholder="客队名称">
                  </div>
                  <div class="col-md-6 mb-2">
                    <input v-model="form.matchInfo.time" type="datetime-local" class="form-control" placeholder="比赛时间">
                  </div>
                  <div class="col-md-6 mb-2">
                    <select v-model="form.planType" class="form-select">
                      <option value="single">单关</option>
                      <option value="combine">串关</option>
                      <option value="system">系统投注</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">推荐结果</label>
                  <input v-model="form.prediction" type="text" class="form-control" placeholder="如：主胜">
                </div>
                <div class="col-md-4">
                  <label class="form-label">赔率</label>
                  <input v-model="form.odds" type="number" step="0.01" class="form-control" placeholder="1.50">
                </div>
                <div class="col-md-4">
                  <label class="form-label">信心指数</label>
                  <select v-model="form.confidence" class="form-select">
                    <option value="1">⭐ (20%)</option>
                    <option value="2">⭐⭐ (40%)</option>
                    <option value="3">⭐⭐⭐ (60%)</option>
                    <option value="4">⭐⭐⭐⭐ (80%)</option>
                    <option value="5">⭐⭐⭐⭐⭐ (100%)</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">解锁所需积分 <span class="text-danger">*</span></label>
                <input v-model="form.pricePoints" type="number" class="form-control" min="10" max="500" value="50">
                <div class="form-text">设置 10-500 积分，作者可获得 30% 分成</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">详细分析内容 <span class="text-danger">*</span></label>
                <textarea v-model="form.content" class="form-control" rows="10" required placeholder="请详细分析比赛形势、数据、推荐理由等..."></textarea>
              </div>
              
              <div class="alert alert-info">
                <small>
                  <i class="bi bi-info-circle"></i> 
                  温馨提示：发布方案后将进入审核状态，审核通过后即可查看。请确保内容真实有效，不得发布虚假信息。
                </small>
              </div>
              
              <div class="d-flex gap-3">
                <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitting ? '提交中...' : '发布方案' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="$router.history.back()">取消</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()

const form = ref({
  lotteryTypeId: '',
  title: '',
  summary: '',
  content: '',
  matchInfo: { home: '', away: '', time: '' },
  prediction: '',
  odds: '',
  confidence: 3,
  planType: 'single',
  pricePoints: 50
})

const lotteryTypes = ref([])
const submitting = ref(false)

onMounted(async () => {
  await loadLotteryTypes()
})

async function loadLotteryTypes() {
  try {
    const res = await api.get('/api/plans')
    lotteryTypes.value = [
      { id: 1, name: '竞彩足球' },
      { id: 2, name: '竞彩篮球' },
      { id: 3, name: '双色球' },
      { id: 4, name: '大乐透' },
      { id: 5, name: '福彩 3D' },
      { id: 6, name: '排列三' },
      { id: 7, name: '排列五' },
      { id: 8, name: '七星彩' },
      { id: 9, name: '七乐彩' },
      { id: 10, name: '快乐 8' }
    ]
  } catch (error) {
    console.error('加载彩种失败:', error)
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    await api.post('/api/plans', form.value)
    alert('方案发布成功！请等待审核。')
    router.push('/profile')
  } catch (error) {
    alert('发布失败：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>
