<template>
  <div class="points-page">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-4">
          <div class="card text-center mb-4">
            <div class="card-body">
              <h6 class="text-muted mb-2">当前积分</h6>
              <div class="display-3 text-warning fw-bold">{{ stats.balance }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card text-center mb-4">
            <div class="card-body">
              <h6 class="text-muted mb-2">累计获得</h6>
              <div class="display-6 text-success fw-bold">{{ stats.totalEarned }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card text-center mb-4">
            <div class="card-body">
              <h6 class="text-muted mb-2">累计消耗</h6>
              <div class="display-6 text-danger fw-bold">{{ stats.totalSpent }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-white border-0 py-3">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">积分明细</h5>
            <div class="btn-group btn-group-sm">
              <button class="btn" :class="filter === 'all' ? 'btn-primary' : 'btn-outline-primary'" @click="filter = 'all'">全部</button>
              <button class="btn" :class="filter === 'earn' ? 'btn-success' : 'btn-outline-success'" @click="filter = 'earn'">收入</button>
              <button class="btn" :class="filter === 'spend' ? 'btn-danger' : 'btn-outline-danger'" @click="filter = 'spend'">支出</button>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
          <div v-else-if="records.length === 0" class="text-center py-5 text-muted">
            暂无记录
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>时间</th>
                <th>类型</th>
                <th>描述</th>
                <th>变动</th>
                <th>余额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td>{{ formatDate(record.createdAt) }}</td>
                <td>
                  <span class="badge" :class="getTypeBadge(record.type)">{{ getTypeText(record.type) }}</span>
                </td>
                <td>{{ record.description }}</td>
                <td :class="record.amount > 0 ? 'text-success' : 'text-danger'">
                  {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
                </td>
                <td>{{ record.balanceAfter }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <nav v-if="totalPages > 1">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/utils/api'

const stats = ref({
  balance: 0,
  totalEarned: 0,
  totalSpent: 0
})

const records = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const filter = ref('all')

onMounted(async () => {
  await loadStats()
  await loadRecords()
})

watch(filter, () => {
  page.value = 1
  loadRecords()
})

async function loadStats() {
  try {
    const res = await api.get('/api/points')
    stats.value = res.data
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

async function loadRecords() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20 }
    if (filter.value !== 'all') params.type = filter.value
    
    const res = await api.get('/api/points/ledger', { params })
    records.value = res.data?.records || []
    totalPages.value = res.data?.totalPages || 1
  } catch (error) {
    console.error('加载记录失败:', error)
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
    loadRecords()
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('zh-CN')
}

function getTypeBadge(type) {
  return type === 'earn' ? 'bg-success' : 'bg-danger'
}

function getTypeText(type) {
  return type === 'earn' ? '收入' : '支出'
}
</script>
