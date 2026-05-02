<template>
  <div class="ai-analyst-page">
    <div class="container py-4">
      <h2><i class="bi bi-robot me-2"></i>AI 数据分析助手</h2>

      <div class="row mt-4">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">智能问答</h5>
            </div>
            <div class="card-body">
              <div class="chat-box mb-3 p-3 border rounded" style="height: 400px; overflow-y: auto;">
                <div v-for="(msg, i) in messages" :key="i" class="mb-3" :class="msg.role">
                  <div class="fw-bold">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
                  <div class="p-2 rounded" :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              <div class="input-group">
                <input type="text" class="form-control" v-model="inputMessage" 
                       placeholder="请输入问题..." @keyup.enter="send">
                <button class="btn btn-primary" @click="send" :disabled="loading">
                  <i v-if="loading" class="bi bi-hourglass-split me-1"></i>
                  <i v-else class="bi bi-send me-1"></i>{{ loading ? '思考中...' : '发送' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card mb-3">
            <div class="card-header">快捷问题</div>
            <div class="card-body">
              <button class="btn btn-outline-primary w-100 mb-2" @click="ask('今天有哪些比赛？')">今天有哪些比赛？</button>
              <button class="btn btn-outline-primary w-100 mb-2" @click="ask('双色球历史开奖数据')">双色球历史开奖数据</button>
              <button class="btn btn-outline-primary w-100" @click="ask('分析这场比赛')">分析这场比赛</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header">会话历史</div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li v-for="item in history" :key="item.id" class="list-group-item list-group-item-action" @click="loadSession(item.sessionId)">
                  {{ item.message?.substring(0, 30) }}...
                  <small class="text-muted d-block">{{ formatDate(item.createdAt) }}</small>
                </li>
              </ul>
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
  name: 'AIAnalyst',
  data() {
    return {
      messages: [],
      inputMessage: '',
      loading: false,
      history: [],
      sessionId: 'session_' + Date.now()
    }
  },
  mounted() {
    this.loadHistory()
  },
  methods: {
    async ask(question) {
      this.inputMessage = question
      this.send()
    },
    async send() {
      if (!this.inputMessage.trim()) return
      
      this.messages.push({ role: 'user', content: this.inputMessage })
      const message = this.inputMessage
      this.inputMessage = ''
      this.loading = true

      try {
        const res = await api.post('/ai-analyst/chat', {
          message,
          sessionId: this.sessionId
        })
        this.messages.push({ role: 'ai', content: res.data.data.response })
      } catch (error) {
        this.messages.push({ role: 'ai', content: 'AI 暂时不在，请稍后再试' })
      } finally {
        this.loading = false
      }
    },
    async loadHistory() {
      const res = await api.get('/ai-analyst/history')
      this.history = res.data.data.history || []
    },
    loadSession(sessionId) {
      this.sessionId = sessionId
      // TODO: 加载历史会话消息
    },
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.user { text-align: right; }
.ai { text-align: left; }
</style>
