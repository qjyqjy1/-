<template>
  <div class="ad-container mb-4">
    <div v-if="ads.length > 0 && ads[0].jsCode" class="ad-content" v-html="ads[0].jsCode"></div>
    <div v-else class="ad-placeholder">
      <small class="text-muted">广告位：{{ position }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const props = defineProps({
  position: {
    type: String,
    required: true
  }
})

const ads = ref([])

onMounted(async () => {
  try {
    const res = await api.get(`/api/ads?position=${props.position}`)
    ads.value = res.data?.ads || []
  } catch (error) {
    console.error('加载广告失败:', error)
  }
})
</script>

<style scoped>
.ad-placeholder {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  min-height: 100px;
}
</style>
