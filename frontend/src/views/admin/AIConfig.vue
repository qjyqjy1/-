<template>
  <div class="ai-config-page">
    <div class="container py-4">
      <h2 class="mb-4">
        <i class="bi bi-robot me-2"></i>AI 配置管理
      </h2>

      <!-- 供应商列表 -->
      <div class="row">
        <div class="col-md-4 mb-4" v-for="provider in providers" :key="provider.key">
          <div class="card h-100" :class="{'border-success': provider.enabled}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">{{ provider.name }}</h5>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" 
                         :checked="provider.enabled"
                         @change="toggleProvider(provider.key, $event.target.checked)">
                </div>
              </div>
              
              <div class="mb-3">
                <span class="badge" :class="provider.enabled ? 'bg-success' : 'bg-secondary'">
                  {{ provider.enabled ? '已启用' : '已禁用' }}
                </span>
                <span v-if="provider.hasApiKey" class="badge bg-primary ms-2">
                  <i class="bi bi-key me-1"></i>已配置 Key
                </span>
              </div>

              <div class="mb-3">
                <small class="text-muted">可用模型:</small>
                <div class="mt-1">
                  <span v-for="model in provider.models" :key="model" 
                        class="badge bg-light text-dark me-1 mb-1">
                    {{ model }}
                  </span>
                </div>
              </div>

              <div class="d-grid gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="showConfig(provider)">
                  <i class="bi bi-gear me-1"></i>配置
                </button>
                <button class="btn btn-sm btn-outline-success" @click="testConnection(provider.key)">
                  <i class="bi bi-wifi me-1"></i>测试连接
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 配置模态框 -->
      <div class="modal fade" tabindex="-1" :class="{'show d-block': showConfigModal}" 
           v-if="showConfigModal" @click.self="closeConfig">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">配置 {{ currentProvider?.name }}</h5>
              <button type="button" class="btn-close" @click="closeConfig"></button>
            </div>
            <div class="modal-body">
              <form v-if="currentProvider">
                <div class="mb-3">
                  <label class="form-label">API Key</label>
                  <input type="password" class="form-control" v-model="config.apiKey" 
                         :placeholder="currentProvider.key === 'azure' ? '输入 Azure API Key' : '输入 API Key'">
                </div>

                <div class="mb-3" v-if="currentProvider.key === 'custom' || currentProvider.key === 'azure'">
                  <label class="form-label">Base URL</label>
                  <input type="text" class="form-control" v-model="config.baseUrl" 
                         :placeholder="currentProvider.baseUrl">
                  <div class="form-text">
                    {{ currentProvider.key === 'azure' ? '格式：https://{resource}.openai.azure.com/openai/deployments/{deployment}' : '自定义 API 地址' }}
                  </div>
                </div>

                <div class="mb-3" v-if="currentProvider.key === 'azure'">
                  <label class="form-label">Resource Name</label>
                  <input type="text" class="form-control" v-model="config.resource" 
                         placeholder="your-resource-name">
                </div>

                <div class="mb-3">
                  <label class="form-label">默认模型</label>
                  <select class="form-select" v-model="config.defaultModel">
                    <option v-for="model in currentProvider.models" :key="model" :value="model">
                      {{ model }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">自定义模型 (每行一个)</label>
                  <textarea class="form-control" rows="3" v-model="customModelsText"
                            placeholder="gpt-4-1106-preview&#10;gpt-4-vision-preview"></textarea>
                  <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click="addCustomModels">
                    <i class="bi bi-plus-circle me-1"></i>添加模型
                  </button>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Max Tokens</label>
                      <input type="number" class="form-control" v-model.number="config.maxTokens" 
                             placeholder="2000">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Temperature</label>
                      <input type="number" class="form-control" v-model.number="config.temperature" 
                             step="0.1" min="0" max="2" placeholder="0.7">
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeConfig">取消</button>
              <button type="button" class="btn btn-primary" @click="saveConfig">
                <i class="bi bi-save me-1"></i>保存配置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试连接 Toast -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div class="toast" :class="{'show': showToast}" role="alert">
        <div class="toast-header" :class="testResult.success ? 'bg-success text-white' : 'bg-danger text-white'">
          <strong class="me-auto">{{ testResult.success ? '✅ 连接成功' : '❌ 连接失败' }}</strong>
          <button type="button" class="btn-close" @click="showToast = false"></button>
        </div>
        <div class="toast-body">{{ testResult.message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'AIConfig',
  
  data() {
    return {
      providers: [],
      showConfigModal: false,
      currentProvider: null,
      config: {
        apiKey: '',
        baseUrl: '',
        resource: '',
        defaultModel: '',
        maxTokens: 2000,
        temperature: 0.7,
        extra: {}
      },
      customModelsText: '',
      showToast: false,
      testResult: { success: false, message: '' }
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
        alert('加载供应商列表失败：' + (error.message || error))
      }
    },

    showConfig(provider) {
      this.currentProvider = provider
      this.config = {
        apiKey: '',
        baseUrl: provider.baseUrl,
        resource: '',
        defaultModel: provider.models[0],
        maxTokens: 2000,
        temperature: 0.7
      }
      this.customModelsText = ''
      this.showConfigModal = true
    },

    closeConfig() {
      this.showConfigModal = false
      this.currentProvider = null
    },

    async saveConfig() {
      try {
        const customModels = this.customModelsText.split('\n').filter(m => m.trim())
        const models = customModels.length > 0 
          ? [...new Set([...this.currentProvider.models, ...customModels])]
          : this.currentProvider.models

        await api.post(`/ai/providers/${this.currentProvider.key}`, {
          providerKey: this.currentProvider.key,
          config: {
            ...this.config,
            models,
            enabled: true
          }
        })

        alert('保存成功！')
        this.closeConfig()
        this.loadProviders()
      } catch (error) {
        alert('保存失败：' + (error.message || error))
      }
    },

    async addCustomModels() {
      const models = this.customModelsText.split('\n').filter(m => m.trim())
      if (models.length === 0) return

      try {
        for (const model of models) {
          await api.post(`/ai/providers/${this.currentProvider.key}/models`, {
            providerKey: this.currentProvider.key,
            model: model.trim()
          })
        }
        
        this.currentProvider.models.push(...models)
        this.currentProvider.models = [...new Set(this.currentProvider.models)]
        this.customModelsText = ''
        alert('模型添加成功！')
      } catch (error) {
        alert('添加模型失败：' + (error.message || error))
      }
    },

    async toggleProvider(providerKey, enabled) {
      try {
        await api.post(`/ai/providers/${providerKey}`, {
          providerKey,
          config: { enabled }
        })
        this.loadProviders()
      } catch (error) {
        alert('操作失败：' + (error.message || error))
      }
    },

    async testConnection(providerKey) {
      try {
        const res = await api.get(`/ai/providers/${providerKey}/test`)
        this.testResult = res.data
      } catch (error) {
        this.testResult = { success: false, message: error.message || '测试失败' }
      }
      this.showToast = true
      setTimeout(() => this.showToast = false, 3000)
    }
  }
}
</script>

<style scoped>
.ai-config-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.modal {
  background: rgba(0,0,0,0.5);
}
</style>
