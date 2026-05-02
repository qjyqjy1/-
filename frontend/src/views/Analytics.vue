<template>
  <div class="analytics-page">
    <div class="container py-4">
      <h2><i class="bi bi-graph-up me-2"></i>数据可视化</h2>

      <div class="row g-4 mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">开奖趋势</h5>
            </div>
            <div class="card-body">
              <div ref="trendChart" style="height: 300px;"></div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">号码分布</h5>
            </div>
            <div class="card-body">
              <div ref="distributionChart" style="height: 300px;"></div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">冷热号分析</h5>
            </div>
            <div class="card-body">
              <div ref="heatmapChart" style="height: 300px;"></div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">用户行为</h5>
            </div>
            <div class="card-body">
              <div ref="userChart" style="height: 300px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Analytics',
  data() {
    return {
      trendChart: null,
      distributionChart: null,
      heatmapChart: null,
      userChart: null
    }
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      this.initTrendChart()
      this.initDistributionChart()
      this.initHeatmapChart()
      this.initUserChart()
    },
    initTrendChart() {
      const chart = echarts.init(this.$refs.trendChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['双色球', '大乐透', '福彩 3D', '排列 5', '七乐彩', '快乐 8'] },
        yAxis: { type: 'value' },
        series: [{
          name: '销量',
          type: 'line',
          data: [120, 200, 150, 80, 70, 110],
          smooth: true,
          areaStyle: { opacity: 0.3 }
        }]
      })
      this.trendChart = chart
    },
    initDistributionChart() {
      const chart = echarts.init(this.$refs.distributionChart)
      const data = Array.from({length: 80}, (_, i) => ({
        value: Math.floor(Math.random() * 50) + 1,
        itemStyle: { color: `rgb(${Math.random() * 200}, ${Math.random() * 100}, ${Math.random() * 100})` }
      }))
      chart.setOption({
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category' },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data }]
      })
      this.distributionChart = chart
    },
    initHeatmapChart() {
      const chart = echarts.init(this.$refs.heatmapChart)
      const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      const data = days.map((day, i) => hours.map((hour, j) => [j, i, Math.floor(Math.random() * 100)]))
        .flat()
      chart.setOption({
        tooltip: { position: 'top' },
        xAxis: { type: 'category', data: hours },
        yAxis: { type: 'category', data: days },
        visualMap: { min: 0, max: 100, calculable: true },
        series: [{ type: 'heatmap', data }]
      })
      this.heatmapChart = chart
    },
    initUserChart() {
      const chart = echarts.init(this.$refs.userChart)
      chart.setOption({
        tooltip: {},
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: '签到' },
            { value: 735, name: '解锁方案' },
            { value: 580, name: '看广告' },
            { value: 484, name: '收藏' },
            { value: 300, name: '分享' }
          ]
        }]
      })
      this.userChart = chart
    }
  }
}
</script>
