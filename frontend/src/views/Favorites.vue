<template>
  <div class="container py-4">
    <div class="text-center">
      <h3>我的收藏</h3>
      <p class="text-muted">查看所有收藏的方案</p>
    </div>
    
    <div class="row mt-4">
      <div class="col-lg-8">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="plans.length === 0" class="text-center py-5 text-muted">
          暂无收藏，<router-link to="/plans">去逛逛</router-link>
        </div>
        <PlanCard v-for="plan in plans" :key="plan.id" :plan="plan" />
      </div>
      <div class="col-lg-4">
        <AdBanner position="detail_side" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import PlanCard from '@/components/PlanCard.vue'
import AdBanner from '@/components/AdBanner.vue'

const plans = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/collections')
    plans.value = res.data?.plans || []
  } catch (error) {
    console.error('加载收藏失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
