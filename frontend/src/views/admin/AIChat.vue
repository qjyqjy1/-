<template>
  <div class="ai-chat-page">
    <div class="container py-4">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-chat-dots me-2"></i>AI 对话
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">供应商</label>
                <select class="form-select" v-model="selectedProvider" @change="onProviderChange">
                  <option value="">选择供应商</option>
                  <option v-for="p in enabledProviders" :key="p.key" :value="p.key">
                    {{ p.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3" v-if="selectedProvider">
                <label class="form-label">模型</label>
                <select class="form-select" v-model="selectedModel">
                  <option v-for="m in currentModels" :key="m" :value="m">
                    {{ m }}
                  </option>
                </select>
              </div>

              <button class="btn btn-primary w-100" @click="startNewChat" :disabled="!selectedProvider">
                <i class="bi bi-plus-circle me-1"></i>新建对话
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-robot me-2"></i>
                {{ currentChat ? currentChat.title : '选择供应商开始对话' }}
              </h5>
              <button v-if="currentChat" class="btn btn-sm btn-outline-danger" @click="clearChat">
                <i class="bi bi-trash me-1"></i>清空
              </button>
            </div>
            <div class="card-body chat-body" ref="chatBody">
              <div v-if="!currentChat" class="text-center text-muted py-5">
                <i class="bi bi-chat-text-display fs-1"></i>
                <p class="mt-3">请选择 AI 供应商开始对话</p>
              </div>

              <div v-else class="messages">
                <div v-for="(msg, idx) in currentChat.messages" :key="idx" 
                     class="message" :class="msg.role">
                  <div class="message-header">
                    <span class="badge" :class="msg.role === 'user' ? 'bg-primary' : 'bg-success'">
                      {{ msg.role === 'user' ? '我' : 'AI' }}
                    </span>
                    <small class="text-muted">{{ msg.time }}</small>
                  </div>
                  <div class="message-content">{{ msg.content }}</div>
                </div>

                <div v-if="loading" class="message ai">
                  <div class="message-header">
                    <span class="badge bg-success">AI</span>
                    <small class="text-muted">思考中...</small>
                  </div>
                  <div class="message-content">
                    <div class="spinner-border spinner-border-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <form @submit.prevent="sendMessage">
                <div class="input-group">
                  <textarea class="form-control" v-model="messageText" 
                            placeholder="输入消息..." rows="2" 
                            @keydown.ctrl.enter="sendMessage"></textarea>
                  <button class="btn btn-primary" type="submit" 
                          :disabled="!messageText.trim() || loading || !currentChat">
                    <i class="bi bi-send me-1"></i>发送
                  </button>
                </div>
              </form>
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
  name: 'AIChat',
  
  data() {
    return {
      providers: [],
      selectedProvider: '',
      selectedModel: '',
      currentModels: [],
      currentChat: null,
      messageText: '',
      loading: false
    }
  },

  computed: {
    enabledProviders() {
      return this.providers.filter(p => p.enabled)
    }
  },

  mounted() {
    this.loadProviders()
  },

  methods: {
    async loadProviders() {
      try {
        const res = await api.get('/ai/providers')
        this.providers = res.data.providers || []
      } catch (error) {
        console.error('加载供应商失败:', error)
      }
    },

    onProviderChange() {
      const provider = this.providers.find(p => p.key === this.selectedProvider)
      if (provider) {
        this.currentModels = provider.models
        this.selectedModel = provider.defaultModel || provider.models[0]
      }
    },

    startNewChat() {
      const provider = this.providers.find(p => p.key === this.selectedProvider)
      this.currentChat = {
        id: Date.now(),
        provider: this.selectedProvider,
        model: this.selectedModel,
        title: '新对话',
        messages: []
      }
    },

    async sendMessage() {
      if (!this.messageText.trim() || !this.currentChat) return

      const userMsg = {
        role: 'user',
        content: this.messageText.trim(),
        time: new Date().toLocaleTimeString()
      }
      this.currentChat.messages.push(userMsg)
      
      const messages = this.currentChat.messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      this.messageText = ''
      this.loading = true
      this.scrollToBottom()

      try {
        const res = await api.post('/ai/chat', {
          providerKey: this.currentChat.provider,
          messages,
          options: { model: this.currentChat.model }
        })

        const aiMsg = {
          role: 'ai',
          content: res.data.data.content,
          time: new Date().toLocaleTimeString()
        }
        this.currentChat.messages.push(aiMsg)
        
        if (this.currentChat.messages.length === 2) {
          this.currentChat.title = userMsg.content.substring(0, 20) + '...'
        }
      } catch (error) {
        const errMsg = {
          role: 'ai',
          content: '调用失败：' + (error.message || error),
          time: new Date().toLocaleTimeString()
        }
        this.currentChat.messages.push(errMsg)
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },

    clearChat() {
      if (confirm('确定清空对话吗？')) {
        this.currentChat.messages = []
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatBody) {
          this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight
        }
      })
    }
  }
}
</script>

<style scoped>
.ai-chat-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.chat-body {
  height: 500px;
  overflow-y: auto;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 80%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f1f3f5;
}

.message.user {
  align-self: flex-end;
  background: #0d6efd;
  color: white;
}

.message.ai {
  align-self: flex-start;
  background: #e9ecef;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

textarea.form-control {
  resize: none;
}
</style>
