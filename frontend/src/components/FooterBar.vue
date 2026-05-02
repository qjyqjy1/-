<template>
  <footer class="footer mt-auto py-4 bg-dark">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <p class="text-white mb-2">
            &copy; 2024 竞彩福彩投注方案分享平台 - 专业竞彩分析社区
          </p>
          <p class="text-muted small">
            温馨提示：彩票有风险，投注需谨慎。未满 18 岁禁止购彩。
          </p>
        </div>
        <div class="col-md-6 text-md-end">
          <router-link to="/" class="text-muted me-3">首页</router-link>
          <router-link to="/plans" class="text-muted me-3">方案列表</router-link>
          <a href="#" class="text-muted">联系我们</a>
        </div>
      </div>
      
      <div class="ad-footer mt-3" v-if="adCode">
        <div class="ad-placeholder" v-html="adCode"></div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const adCode = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/api/ads?position=footer')
    if (res.data && res.data.ads && res.data.ads.length > 0) {
      adCode.value = res.data.ads[0].jsCode
    }
  } catch (error) {
    console.error('加载底部广告失败:', error)
  }
})
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.ad-footer {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 15px;
}
</style>
