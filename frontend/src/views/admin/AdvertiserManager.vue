<template>
  <div class="advertiser-manager">
    <div class="container py-4">
      <h2><i class="bi bi-briefcase me-2"></i>广告主管理</h2>

      <ul class="nav nav-tabs my-4">
        <li class="nav-item">
          <button class="nav-link active" @click="tab = 'list'">广告主列表</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" @click="tab = 'campaigns'">广告活动</button>
        </li>
      </ul>

      <div v-if="tab === 'list'" class="card">
        <div class="card-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>公司</th>
                <th>联系人</th>
                <th>电话</th>
                <th>余额</th>
                <th>状态</th>
                <th>申请时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in advertisers" :key="item.id">
                <td>{{ item.companyName }}</td>
                <td>{{ item.contactName }}</td>
                <td>{{ item.contactPhone }}</td>
                <td>¥{{ item.balance }}</td>
                <td>
                  <span class="badge" :class="getStatusBadge(item.status)">
                    {{ getStatusText(item.status) }}
                  </span>
                </td>
                <td>{{ formatDate(item.createdAt) }}</td>
                <td>
                  <button v-if="item.status === 'pending'" class="btn btn-sm btn-success" @click="review(item.id, 'approved')">通过</button>
                  <button v-if="item.status === 'pending'" class="btn btn-sm btn-danger" @click="review(item.id, 'rejected')">拒绝</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="tab === 'campaigns'" class="card">
        <div class="card-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>活动名称</th>
                <th>广告主</th>
                <th>预算</th>
                <th>已消耗</th>
                <th>状态</th>
                <th>周期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in campaigns" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.Advertiser?.companyName || '-' }}</td>
                <td>¥{{ item.budget }}</td>
                <td>¥{{ item.spent }}</td>
                <td>
                  <span class="badge" :class="getCampaignStatusBadge(item.status)">
                    {{ item.status }}
                  </span>
                </td>
                <td>{{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="pauseCampaign(item.id)">暂停</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'AdvertiserManager',
  data() {
    return {
      tab: 'list',
      advertisers: [],
      campaigns: []
    }
  },
  mounted() {
    this.loadAdvertisers()
    this.loadCampaigns()
  },
  methods: {
    async loadAdvertisers() {
      const res = await api.get('/advertiser')
      this.advertisers = res.data.data.advertisers || []
    },
    async loadCampaigns() {
      const res = await api.get('/advertiser/admin/campaigns')
      this.campaigns = res.data.data.campaigns || []
    },
    async review(id, status) {
      await api.post(`/advertiser/${id}/review`, { status })
      alert('审核完成')
      this.loadAdvertisers()
    },
    getStatusBadge(status) {
      return { pending: 'bg-warning', approved: 'bg-success', rejected: 'bg-danger' }[status]
    },
    getStatusText(status) {
      return { pending: '待审核', approved: '已认证', rejected: '已拒绝' }[status]
    },
    getCampaignStatusBadge(status) {
      return { pending: 'bg-secondary', active: 'bg-success', paused: 'bg-warning', ended: 'bg-secondary' }[status]
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },
    async pauseCampaign(id) {
      // TODO: 实现暂停逻辑
      alert('暂停功能待实现')
    }
  }
}
</script>
