<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-lg-4">
        <div class="card text-center mb-4">
          <div class="card-body">
            <img :src="user?.avatar" class="rounded-circle mb-3" width="100" height="100">
            <h4>{{ user?.nickname || user?.username }}</h4>
            <p class="text-muted">{{ user?.bio || '这个人很懒，什么也没写' }}</p>
            <div class="d-flex justify-content-center gap-3">
              <div>
                <div class="h5 mb-0">{{ user?.points || 0 }}</div>
                <small class="text-muted">积分</small>
              </div>
              <div>
                <div class="h5 mb-0">{{ stats.followers }}</div>
                <small class="text-muted">粉丝</small>
              </div>
              <div>
                <div class="h5 mb-0">{{ stats.followings }}</div>
                <small class="text-muted">关注</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card mb-4">
          <div class="card-header bg-white border-0 py-3">
            <h6 class="mb-0 fw-bold">数据统计</h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>发布方案</span>
                <strong>{{ stats.plans }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span>被点赞</span>
                <strong>{{ stats.likes }}</strong>
              </div>
            </div>
            <div>
              <div class="d-flex justify-content-between">
                <span>被收藏</span>
                <strong>{{ stats.collections }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header bg-white border-0 py-3">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <button class="nav-link" :class="{ active: tab === 'plans' }" @click="tab = 'plans'">
                  我的发布
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" :class="{ active: tab === 'collections' }" @click="tab = 'collections'">
                  我的收藏
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" :class="{ active: tab === 'unlocks' }" @click="tab = 'unlocks'">
                  我的解锁
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <div v-if="tab === 'plans'">
              <div v-if="plans.length === 0" class="text-center py-5 text-muted">
                暂无发布的方案
                <router-link to="/publish" class="d-block mt-2">去发布</router-link>
              </div>
              <PlanCard v-for="plan in plans" :key="plan.id" :plan="plan" />
            </div>
            
            <div v-else-if="tab === 'collections'">
              <div v-if="collections.length === 0" class="text-center py-5 text-muted">
                暂无收藏
              </div>
              <PlanCard v-for="plan in collections" :key="plan.id" :plan="plan" />
            </div>
            
            <div v-else>
              <div v-if="unlocks.length === 0" class="text-center py-5 text-muted">
                暂无解锁的方案
              </div>
              <PlanCard v-for="plan in unlocks" :key="plan.id" :plan="plan" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { useAuthStore } from '@/store/auth'
import PlanCard from '@/components/PlanCard.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const tab = ref('plans')
const stats = ref({
  plans: 0,
  collections: 0,
  unlocks: 0,
  followers: 0,
  followings: 0,
  likes: 0
})

const plans = ref([])
const collections = ref([])
const unlocks = ref([])

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    const [plansRes, collectionsRes, statsRes] = await Promise.all([
      api.get('/plans?status=published'),
      api.get('/collections'),
      api.get(`/api/users/${user.value.id}`)
    ])
    
    plans.value = plansRes.data?.plans || []
    collections.value = collectionsRes.data?.plans || []
    stats.value = {
      ...stats.value,
      plans: plans.value.length,
      collections: collections.value.length,
      followers: statsRes.data?.user?.followerCount || 0,
      followings: statsRes.data?.user?.followingCount || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}
</script>
