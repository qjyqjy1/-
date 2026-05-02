<template>
  <div class="lottery-detail-page">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <span :style="{ color: config?.color }">{{ config?.lotteryName || lotteryType }}</span>
              </h4>
              <span class="badge bg-secondary">{{ config?.drawDays }} 开奖</span>
            </div>
            <div class="card-body">
              <div v-if="latestResult" class="mb-4">
                <h5 class="mb-3">最新开奖</h5>
                <div class="p-3 bg-light rounded">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">期号</span>
                    <span class="fw-bold">{{ latestResult.issueNumber }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">开奖日期</span>
                    <span>{{ formatDate(latestResult.drawDate) }}</span>
                  </div>
                  <div class="mt-3">
                    <div class="balls d-flex flex-wrap gap-2">
                      <span v-for="num in parseNumbers(latestResult.winningNumbers)" :key="num"
                            class="ball" :class="getBallClass(num)">
                        {{ num }}
                      </span>
                      <span v-if="latestResult.specialNumber" 
                            class="ball ball-special">{{ latestResult.specialNumber }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="latestResult?.prizeInfo" class="mb-4">
                <h5 class="mb-3">奖金详情</h5>
                <table class="table table-sm">
                  <thead>
                    <tr><th>奖级</th><th>中奖注数</th><th>单注奖金</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="prize in latestResult.prizeInfo" :key="prize.level">
                      <td>{{ prize.level }}</td>
                      <td>{{ prize.count }}</td>
                      <td>¥{{ (prize.amount / 10000).toFixed(0) }}万</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">历史开奖</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>期号</th>
                      <th>开奖日期</th>
                      <th>开奖号码</th>
                      <th>详情</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in history" :key="item.id">
                      <td>{{ item.issueNumber }}</td>
                      <td>{{ formatDate(item.drawDate) }}</td>
                      <td>
                        <div class="balls d-flex gap-1">
                          <span v-for="num in parseNumbers(item.winningNumbers)" :key="num"
                                class="ball ball-sm" :class="getBallClass(num)">
                            {{ num }}
                          </span>
                          <span v-if="item.specialNumber" 
                                class="ball ball-sm ball-special">{{ item.specialNumber }}</span>
                        </div>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary" @click="showDetail(item)">
                          查看
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card mb-3">
            <div class="card-header fw-bold">快速导航</div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link to="/lottery/ssq" class="btn btn-danger">双色球</router-link>
                <router-link to="/lottery/dlt" class="btn" style="background: #6f42c1; color: white;">大乐透</router-link>
                <router-link to="/lottery/3d" class="btn btn-success">福彩 3D</router-link>
                <router-link to="/lottery/p5" class="btn btn-primary">排列 5</router-link>
                <router-link to="/lottery/qlc" class="btn" style="background: #fd7e14; color: white;">七乐彩</router-link>
              </div>
            </div>
          </div>

          <div v-if="latestResult" class="card">
            <div class="card-header fw-bold">奖池信息</div>
            <div class="card-body">
              <div class="mb-3">
                <small class="text-muted">当前奖池</small>
                <div class="fs-4 fw-bold text-primary">¥{{ (latestResult.prizePool / 100000000).toFixed(2) }}亿</div>
              </div>
              <div class="mb-3">
                <small class="text-muted">上期销售额</small>
                <div class="fs-6">¥{{ (latestResult.salesAmount / 10000).toFixed(0) }}万</div>
              </div>
              <div v-if="latestResult.nextIssue">
                <small class="text-muted">下期期号</small>
                <div class="fw-bold">{{ latestResult.nextIssue }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'LotteryDetail',
  data() {
    return {
      lotteryType: this.$route.params.type,
      config: null,
      latestResult: null,
      history: []
    }
  },
  mounted() {
    this.loadDetail()
  },
  watch: {
    '$route.params.type'() {
      this.lotteryType = this.$route.params.type
      this.loadDetail()
    }
  },
  methods: {
    async loadDetail() {
      try {
        const res = await api.get(`/lottery/${this.lotteryType}/detail`)
        const data = res.data.data
        this.config = data.config
        this.latestResult = data.latest
        this.history = data.history || []
      } catch (error) {
        alert('加载失败')
      }
    },
    parseNumbers(str) {
      if (!str) return []
      return str.split(',').map(n => n.trim())
    },
    getBallClass(num) {
      const n = parseInt(num)
      return n <= 10 ? 'ball-red' : 'ball-blue'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },
    showDetail(item) {
      alert(`期号：${item.issueNumber}\n号码：${item.winningNumbers}`)
    }
  }
}
</script>

<style scoped>
.ball {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
}

.ball-sm {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.ball-red { background: #dc3545; }
.ball-blue { background: #0d6efd; }
.ball-special { background: #ffc107; color: #000; }
</style>
