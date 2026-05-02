<template>
  <div class="search-page">
    <div class="container py-4">
      <h2 class="mb-4"><i class="bi bi-search me-2"></i>搜索</h2>
      
      <div class="search-box mb-4">
        <div class="input-group input-group-lg">
          <input type="text" class="form-control" v-model="keyword" 
                 placeholder="搜索方案标题或内容..." @keyup.enter="search">
          <button class="btn btn-primary" @click="search">
            <i class="bi bi-search me-1"></i>搜索
          </button>
        </div>
      </div>

      <div v-if="hotSearch.length > 0" class="mb-4">
        <small class="text-muted">热门搜索：</small>
        <span v-for="item in hotSearch" :key="item.id" 
              class="badge bg-light text-dark me-2 mb-2" 
              style="cursor: pointer" @click="keyword = item.text; search()">
          🔥 {{ item.text }}
        </span>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="results.length > 0">
        <p class="text-muted mb-3">找到 {{ total }} 个相关方案</p>
        <div class="row">
          <div class="col-md-6 col-lg-4 mb-4" v-for="plan in results" :key="plan.id">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ plan.title }}</h5>
                <p class="card-text text-muted small">{{ plan.content?.substring(0, 100) }}...</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">
                    <i class="bi bi-eye me-1"></i>{{ plan.viewCount || 0 }}
                    <i class="bi bi-unlock ms-2 me-1"></i>{{ plan.unlockCount || 0 }}
                  </small>
                  <button class="btn btn-sm btn-outline-primary" @click="$router.push(`/plan/${plan.id}`)">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{disabled: page===1}">
              <a class="page-link" @click="page > 1 && loadPage(page-1)">上一页</a>
            </li>
            <li class="page-item disabled">
              <span class="page-link">{{ page }} / {{ totalPages }}</span>
            </li>
            <li class="page-item" :class="{disabled: page>=totalPages}">
              <a class="page-link" @click="page < totalPages && loadPage(page+1)">下一页</a>
            </li>
          </ul>
        </nav>
      </div>

      <div v-else-if="searched" class="text-center py-5 text-muted">
        <i class="bi bi-emoji-frown fs-1"></i>
        <p class="mt-3">未找到相关结果</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'Search',
  data() {
    return {
      keyword: '',
      results: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      loading: false,
      searched: false,
      hotSearch: []
    }
  },
  mounted() {
    if (this.$route.query.q) {
      this.keyword = this.$route.query.q
      this.search()
    }
    this.loadHotSearch()
  },
  methods: {
    async loadHotSearch() {
      try {
        const res = await api.get('/search/hot')
        this.hotSearch = res.data.data || []
      } catch (error) {}
    },
    async search() {
      if (!this.keyword.trim()) return
      this.page = 1
      this.searched = true
      this.loading = true
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(this.keyword)}&page=${this.page}&limit=${this.limit}`)
        this.results = res.data.data?.plans || []
        this.total = res.data.data?.total || 0
        this.totalPages = Math.ceil(this.total / this.limit)
      } catch (error) {
        alert('搜索失败')
      } finally {
        this.loading = false
      }
    },
    async loadPage(newPage) {
      this.page = newPage
      this.loading = true
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(this.keyword)}&page=${this.page}&limit=${this.limit}`)
        this.results = res.data.data?.plans || []
      } catch (error) {}
      this.loading = false
    }
  }
}
</script>
