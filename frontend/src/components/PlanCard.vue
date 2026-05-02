<template>
  <div class="plan-card card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="badge bg-primary me-2">{{ plan.lotteryType?.name }}</span>
        <span class="badge bg-success">命中率 {{ plan.hitRate }}%</span>
      </div>
      
      <h5 class="card-title mb-2 text-truncate" style="cursor: pointer" @click="$router.push(`/plan/${plan.id}`)">
        {{ plan.title }}
      </h5>
      
      <p class="card-text text-muted mb-3 small">{{ plan.summary || '暂无摘要' }}</p>
      
      <div class="d-flex justify-content-between align-items-center">
        <div class="author-info d-flex align-items-center" style="cursor: pointer" @click="$router.push(`/user/${plan.author?.id}`)">
          <img :src="plan.author?.avatar" class="rounded-circle me-2" width="30" height="30">
          <span class="small text-muted">{{ plan.author?.nickname || plan.author?.username }}</span>
        </div>
        
        <div class="plan-stats d-flex gap-3 text-muted small">
          <span><i class="bi bi-eye"></i> {{ plan.viewCount }}</span>
          <span><i class="bi bi-hand-thumbs-up"></i> {{ plan.likeCount }}</span>
          <span><i class="bi bi-bookmark"></i> {{ plan.collectCount }}</span>
        </div>
        
        <div class="plan-price">
          <span class="text-danger fw-bold">{{ plan.pricePoints }}</span>
          <small class="text-muted">积分</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plan: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.plan-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.plan-card:hover .card-title {
  color: #667eea;
}
</style>
