<template>
  <div id="app">
    <NavBar v-if="showNav" />
    <main class="main-content">
      <router-view />
    </main>
    <FooterBar v-if="showNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'

const route = useRoute()
const showNav = computed(() => {
  return !route.meta.hideLayout
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #f5f6f7;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
}

.ad-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 20px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-placeholder {
  background: #f0f0f0;
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  color: #999;
  border-radius: 8px;
  margin: 10px 0;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .main-content {
    padding: 10px 0;
  }
}
</style>
