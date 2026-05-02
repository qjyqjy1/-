<template>
  <div class="publish-plan-page">
    <div class="container py-4">
      <h2 class="mb-4">
        <i class="bi bi-journal-plus me-2"></i>发布方案
      </h2>

      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">手动发布方案</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">彩种</label>
                    <select class="form-select" v-model="form.lotteryType" required>
                      <option value="">请选择</option>
                      <option value="jc_football">竞彩足球</option>
                      <option value="jc_basketball">竞彩篮球</option>
                      <option value="kl8">快乐 8</option>
                      <option value="ssq">双色球</option>
                      <option value="dlt">大乐透</option>
                      <option value="3d">福彩 3D</option>
                      <option value="p5">排列 5</option>
                      <option value="qlc">七乐彩</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">解锁积分</label>
                    <input type="number" class="form-control" v-model.number="form.unlockPoints" min="1" max="1000" value="10">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">标题</label>
                  <input type="text" class="form-control" v-model="form.title" required placeholder="请输入方案标题">
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">联赛</label>
                    <input type="text" class="form-control" v-model="form.league" placeholder="英超、NBA...">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">主队</label>
                    <input type="text" class="form-control" v-model="form.homeTeam" placeholder="主队">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">客队</label>
                    <input type="text" class="form-control" v-model="form.awayTeam" placeholder="客队">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">比赛时间</label>
                  <input type="datetime-local" class="form-control" v-model="form.matchTime">
                </div>

                <div class="mb-3">
                  <label class="form-label">方案内容</label>
                  <textarea class="form-control" rows="8" v-model="form.content" required placeholder="请输入详细的分析内容..."></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">数据分析</label>
                  <textarea class="form-control" rows="4" v-model="form.analysis" placeholder="核心数据总结..."></textarea>
                </div>

                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <i class="bi bi-send me-1"></i>{{ loading ? '发布中...' : '发布方案' }}
                  </button>
                  <button type="button" class="btn btn-success" @click="showAiModal = true" :disabled="loading">
                    <i class="bi bi-robot me-1"></i>AI生成
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="mb-0">发布说明</h5>
            </div>
            <div class="card-body">
              <ul class="small text-muted mb-0">
                <li>方案发布后立即可见</li>
                <li>用户消耗积分解锁</li>
                <li>内容需合规，不含敏感词</li>
                <li>AI 生成内容需人工审核</li>
              </ul>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">快捷操作</h5>
            </div>
            <div class="card-body">
              <button class="btn btn-outline-primary w-100 mb-2" @click="useTemplate('足球')">
                <i class="bi bi-circle me-1"></i>足球方案模板
              </button>
              <button class="btn btn-outline-warning w-100 mb-2" @click="useTemplate('篮球')">
                <i class="bi bi-circle me-1"></i>篮球方案模板
              </button>
              <button class="btn btn-outline-success w-100" @click="useTemplate('数字彩')">
                <i class="bi bi-circle me-1"></i>数字彩方案模板
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 生成模态框 -->
      <div v-if="showAiModal" class="modal-overlay" @click.self="showAiModal = false">
        <div class="modal-content">
          <h5><i class="bi bi-robot me-2"></i>AI 生成方案</h5>
          <form @submit.prevent="handleAiGenerate">
            <div class="mb-3">
              <label class="form-label">联赛</label>
              <input type="text" class="form-control" v-model="aiForm.league">
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">主队</label>
                <input type="text" class="form-control" v-model="aiForm.homeTeam">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">客队</label>
                <input type="text" class="form-control" v-model="aiForm.awayTeam">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">主队近况</label>
              <textarea class="form-control" rows="2" v-model="aiForm.homeForm"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">客队近况</label>
              <textarea class="form-control" rows="2" v-model="aiForm.awayForm"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">历史交锋</label>
              <textarea class="form-control" rows="2" v-model="aiForm.h2h"></textarea>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="aiLoading">
                <i class="bi bi-magic me-1"></i>{{ aiLoading ? '生成中...' : '生成方案' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="showAiModal = false">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'PublishPlan',
  data() {
    return {
      form: {
        lotteryType: '',
        title: '',
        content: '',
        analysis: '',
        league: '',
        homeTeam: '',
        awayTeam: '',
        matchTime: '',
        unlockPoints: 10
      },
      aiForm: {
        league: '',
        homeTeam: '',
        awayTeam: '',
        homeForm: '',
        awayForm: '',
        h2h: ''
      },
      loading: false,
      aiLoading: false,
      showAiModal: false
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      try {
        await api.post('/plans', this.form)
        alert('发布成功！')
        this.resetForm()
      } catch (error) {
        alert('发布失败：' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },
    async handleAiGenerate() {
      this.aiLoading = true
      try {
        const res = await api.post('/ai-generate/generate', this.aiForm)
        const data = res.data.data
        
        this.form.title = data.title
        this.form.content = data.content
        this.form.analysis = data.analysis
        this.form.lotteryType = this.aiForm.league?.includes('足球') ? 'jc_football' : 
                                this.aiForm.league?.includes('篮球') ? 'jc_basketball' : ''
        
        this.showAiModal = false
        alert('AI 生成成功，可编辑后发布')
      } catch (error) {
        alert('AI 生成失败：' + (error.response?.data?.message || error.message))
      } finally {
        this.aiLoading = false
      }
    },
    useTemplate(type) {
      const templates = {
        '足球': {
          title: '[联赛] 赛事分析参考',
          content: '本场比赛从双方实力、近期状态、历史交锋等维度进行综合分析...\n\n球队动态：\n- 主队近期状态...\n- 客队近期状态...\n\n数据特点：\n- 进球数...\n- 失球数...\n\n综合分析：...',
          analysis: '核心观点：双方实力接近，重点关注某方面数据...'
        },
        '篮球': {
          title: '[NBA] 赛事数据分析',
          content: '从球队阵容、伤病情况、主客场因素等方面进行分析...\n\n球队情况：\n- 排名对比...\n- 近期战绩...\n\n数据参考：\n- 得分能力...\n- 防守效率...\n\n总结：...',
          analysis: '关注点：比赛节奏和防守强度...'
        },
        '数字彩': {
          title: '[彩种] 号码参考',
          content: '基于历史开奖数据的统计分析...\n\n号码特点：\n- 冷热号分布...\n- 奇偶比例...\n- 大小比...\n\n仅供参考：...',
          analysis: '推荐关注几个号码...'
        }
      }
      
      const t = templates[type]
      if (t) {
        this.form.title = t.title
        this.form.content = t.content
        this.form.analysis = t.analysis
      }
    },
    resetForm() {
      this.form = {
        lotteryType: '',
        title: '',
        content: '',
        analysis: '',
        league: '',
        homeTeam: '',
        awayTeam: '',
        matchTime: '',
        unlockPoints: 10
      }
    }
  }
}
</script>

<style scoped>
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
  max-width: 600px;
}
</style>
