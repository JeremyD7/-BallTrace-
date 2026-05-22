import { request, BASE_URL } from './http'

export function getNotifications(params = {}) {
  return request({
    url: '/notifications',
    data: params
  })
}

export function getUnreadCount() {
  return request({
    url: '/notifications/unread-count'
  })
}

export function markAsRead(notificationId) {
  return request({
    url: '/notifications/read',
    method: 'PATCH',
    data: { notificationId }
  })
}

export function markAllAsRead() {
  return request({
    url: '/notifications/read',
    method: 'PATCH',
    data: {}
  })
}

export function deleteNotification(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'DELETE'
  })
}

export function subscribeNotifications(callback) {
  const token = uni.getStorageSync('balltrace_token') || ''
  const baseUrl = typeof BASE_URL === 'function' ? BASE_URL() : BASE_URL
  const eventSource = new EventSource(`${baseUrl}/notifications/stream?token=${token}`)
  
  eventSource.onmessage = function(event) {
    try {
      const data = JSON.parse(event.data)
      callback(data)
    } catch (e) {
      console.error('解析SSE消息失败', e)
    }
  }
  
  eventSource.onerror = function(error) {
    console.error('SSE连接异常，将自动重连', error)
  }
  
  return eventSource
}

export function getExploreMessages() {
  return request({
    url: '/messages/explore'
  })
}

export function getMatchMessages() {
  return request({
    url: '/messages/matches'
  })
}

export function getSystemMessages() {
  return request({
    url: '/messages/system'
  })
}

export function getDirectMessages() {
  return request({
    url: '/messages/direct'
  })
}