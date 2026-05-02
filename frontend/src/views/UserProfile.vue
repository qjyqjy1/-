<template>
  <div class="container py-4">
    <div class="text-center">
      <h3>达人主页</h3>
      <p class="text-muted">{{ user?.nickname || user?.username }}</p>
    </div>
    
    <div class="row mt-4">
      <div class="col-lg-8">
        <h5 class="mb-3">TA 的方案</h5>
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
import { useRouter, useParams } from 'vue-router'
import api from '@/utils/api'
import PlanCard from '@/components/PlanCard.vue'
import AdBanner from '@/components/AdBanner.vue'

const router = useRouter()
const params = useParams()

const user = ref(null)
const plans = ref([])

onMounted(async () => {
  try {
    const [userRes, plansRes] = await Promise.all([
      api.get(`/api/users/${params.id}`),
      api.get(`/api/plans?authorId=${params.id}`)
    ])
    
    user.value = userRes.data?.user
    plans.value = plansRes.data?.plans || []
  } catch (error) {
    console.error('加载失败:', error)
    router.push('/')
  }
})
</script>
