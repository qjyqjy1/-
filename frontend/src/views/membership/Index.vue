<template>
  <div class="membership-page">
    <div class="header-section text-white py-5">
      <div class="container text-center">
        <h1 class="display-4 fw-bold mb-3">会员计划</h1>
        <p class="lead">升级会员，尊享特权</p>
      </div>
    </div>

    <div class="container py-5">
      <div v-if="myMembership && myMembership.level > 1" class="alert alert-success mb-4">
        <i class="bi bi-check-circle me-2"></i>
        当前会员：{{ myMembership.config?.name }} - 有效期至 {{ formatDate(myMembership.endDate) }}
      </div>

      <div class="row g-4">
        <div class="col-md-4" v-for="config in configs" :key="config.level">
          <div class="card h-100" :class="{ 'border-primary': config.level === 2, 'border-danger': config.level === 3 }">
            <div class="card-header text-center pb-3 pt-4" :style="{ background: config.color, color: 'white' }">
              <span class="fs-1">{{ config.icon }}</span>
              <h3 class="my-2">{{ config.name }}</h3>
              <div class="fs-2 fw-bold">¥{{ config.priceMonthly }}<span class="fs-6">/月</span></div>
              <div class="text-white-50">¥{{ config.priceYearly }}/年</div>
            </div>
            <div class="card-body">
              <h5 class="card-title">会员权益</h5>
              <ul class="list-unstyled">
                <li v-if="config.level >= 2" class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>免广告特权</li>
                <li class="mb-2">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  解锁优惠：{{ (1 - config.discount) * 100 }}% OFF
                </li>
                <li v-if="config.level >= 2" class="mb-2">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  AI 助手：{{ config.level === 3 ? '无限次' : '10 次/天' }}
                </li>
                <li v-if="config.level >= 3" class="mb-2">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  优先客服支持
                </li>
                <li v-if="config.level === 1" class="mb-2 text-muted">基础权益</li>
              </ul>
            </div>
            <div class="card-footer bg-white border-0 pb-4 text-center">
              <button 
                v-if="config.level > (myMembership?.level || 1)" 
                class="btn btn-primary w-100" 
                :class="config.level === 3 ? 'btn-danger' : config.level === 2 ? 'btn-warning' : ''"
                @click="purchase(config)">
                {{ myMembership?.level === config.level ? '已开通' : '立即开通' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <h4>常见问题</h4>
        <div class="accordion" id="faqAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                会员如何计费？
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse show">
              <div class="accordion-body">
                会员按月或按年计费，续费时长按比例计算。
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                支持退款吗？
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse">
              <div class="accordion-body">
                虚拟商品一经开通不支持退款，请谨慎购买。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div v-if="showPayment" class="modal-overlay" @click.self="showPayment = false">
      <div class="modal-content">
        <h5>开通{{ selectedConfig?.name }}</h5>
        <p class="text-muted">选择套餐时长</p>
        <div class="d-grid gap-2 mb-3">
          <button class="btn btn-outline-primary" @click="purchaseConfig(30)">
            1 个月 - ¥{{ (selectedConfig?.priceMonthly * 1).toFixed(2) }}
          </button>
          <button class="btn btn-outline-primary" @click="purchaseConfig(90)">
            3 个月 - ¥{{ (selectedConfig?.priceMonthly * 3 * 0.9).toFixed(2) }} <span class="badge bg-danger">9 折</span>
          </button>
          <button class="btn btn-outline-primary" @click="purchaseConfig(365)">
            12 个月 - ¥{{ selectedConfig?.priceYearly }} <span class="badge bg-danger">省 17%</span>
          </button>
        </div>
        <button type="button" class="btn btn-secondary w-100" @click="showPayment = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'Membership',
  data() {
    return {
      configs: [],
      myMembership: null,
      selectedConfig: null,
      showPayment: false
    }
  },
  mounted() {
    this.loadConfigs()
    this.loadMyMembership()
  },
  methods: {
    async loadConfigs() {
      const res = await api.get('/membership/configs')
      this.configs = res.data.data || []
    },
    async loadMyMembership() {
      const res = await api.get('/membership/my')
      this.myMembership = res.data.data
    },
    purchase(config) {
      this.selectedConfig = config
      this.showPayment = true
    },
    async purchaseConfig(durationDays) {
      try {
        const res = await api.post('/membership/order', {
          level: this.selectedConfig.level,
          durationDays
        })
        
        // 跳转支付
        alert(`订单创建成功！\n订单号：${res.data.data.orderNo}\n支付金额：¥${res.data.data.amount}`)
        this.showPayment = false
        setTimeout(() => this.loadMyMembership(), 3000)
      } catch (error) {
        alert('创建订单失败')
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.header-section {
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
}
</style>
