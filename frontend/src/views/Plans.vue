<template>
  <div class="container py-4">
    <AdBanner position="list_top" />
    
    <div class="card mb-4">
      <div class="card-header bg-white border-0 py-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="btn-group w-100" role="group">
              <button 
                v-for="type in lotteryTypes" 
                :key="type.id"
                class="btn btn-sm"
                :class="selectedType === type.id ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedType = type.id; loadPlans()"
              >
                {{ type.name }}
              </button>
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select form-select-sm" v-model="sortBy" @change="loadPlans()">
              <option value="latest">最新</option>
              <option value="hot">最热</option>
              <option value="hitRate">命中率</option>
              <option value="unlock">解锁最多</option>
            </select>
          </div>
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <input 
                v-model="searchKeyword"
                type="text" 
                class="form-control" 
                placeholder="搜索方案..."
                @keyup.enter="handleSearch"
              >
              <button class="btn btn-primary" @click="handleSearch">搜索</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-lg-8">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        
        <div v-else-if="plans.length === 0" class="text-center py-5">
          <div class="text-muted">暂无方案</div>
        </div>
        
        <div v-else>
          <PlanCard v-for="plan in plans" :key="plan.id" :plan="plan" />
        </div>
        
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: page === 1 }">
              <button class="page-link" @click="changePage(page - 1)">上一页</button>
            </li>
            <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: page === p }">
              <button class="page-link" @click="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: page === totalPages }">
              <button class="page-link" @click="changePage(page + 1)">下一页</button>
            </li>
          </ul>
        </nav>
      </div>
      
      <div class="col-lg-4">
        <AdBanner position="detail_side" />
        
        <div class="card mb-4">
          <div class="card-header bg-white border-0 py-3">
            <h6 class="mb-0 fw-bold">📈 热门作者</h6>
          </div>
          <div class="card-body p-0">
            <div v-for="i in 5" :key="i" class="p-3 border-bottom">
              <div class="d-flex align-items-center">
                <img :src="`/avatar${i % 5 + 1}.png`" class="rounded-circle me-3" width="40" height="40">
                <div class="flex-grow-1">
                  <div class="fw-bold">专家{{ i }}号</div>
                  <small class="text-muted">命中率 75%</small>
                </div>
                <button class="btn btn-sm btn-outline-primary">关注</button>
              </div>
            </div>
          </div>
        </div>
        
        <AdBanner position="list_middle" />
      </div>
    </div>
    
    <AdBanner position="list_bottom" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import PlanCard from '@/components/PlanCard.vue'
import AdBanner from '@/components/AdBanner.vue'

const plans = ref([])
const lotteryTypes = ref([])
const selectedType = ref(null)
const sortBy = ref('latest')
const searchKeyword = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(true)

onMounted(async () => {
  await loadLotteryTypes()
  await loadPlans()
})

async function loadLotteryTypes() {
  try {
    const res = await api.get('/api/plans')
    lotteryTypes.value = [
      { id: null, name: '全部' },
      ...(res.data?.plans?.[0]?.lotteryType ? [{ id: res.data.plans[0].lotteryType.id, name: '竞彩' }] : [])
    ]
  } catch (error) {
    console.error('加载彩种失败:', error)
  }
}

async function loadPlans() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: 10,
      sortBy: sortBy.value
    }
    if (selectedType.value) params.lotteryTypeId = selectedType.value
    if (searchKeyword.value) params.search = searchKeyword.value
    
    const res = await api.get('/api/plans', { params })
    plans.value = res.data?.plans || []
    totalPages.value = res.data?.totalPages || 1
  } catch (error) {
    console.error('加载方案失败:', error)
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
    loadPlans()
  }
}

function handleSearch() {
  page.value = 1
  loadPlans()
}
</script>
