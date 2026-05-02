import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/auth'

let socket = null

export const initWebSocket = () => {
  const authStore = useAuthStore()
  const token = authStore.token
  
  if (!token) return
  
  socket = io('http://localhost:3001', {
    auth: { token }
  })
  
  socket.on('connect', () => {
    console.log('WebSocket connected')
    socket.emit('join', { token })
  })
  
  socket.on('notification', (data) => {
    console.log('收到通知:', data)
    // 显示浏览器通知
    if (Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.content,
        icon: '/favicon.ico'
      })
    }
    // 可以在这里触发 Vue 的状态更新
  })
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })
  
  return socket
}

export const getSocket = () => socket

export { socket }
