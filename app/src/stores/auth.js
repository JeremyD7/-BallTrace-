import { defineStore } from 'pinia'
import { request } from '@/api/request'

const TOKEN_KEY = 'balltrace_token'
const USER_KEY = 'balltrace_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: uni.getStorageSync(TOKEN_KEY) || '',
    user: uni.getStorageSync(USER_KEY) || null,
    profile: null
  }),
  actions: {
    async login(payload) {
      const data = await request('/auth/login', {
        method: 'POST',
        data: payload
      })
      this.saveSession(data)
      return data
    },
    async register(payload) {
      const data = await request('/auth/register', {
        method: 'POST',
        data: payload
      })
      this.saveSession(data)
      return data
    },
    async fetchProfile() {
      if (!this.token) {
        throw new Error('Not logged in')
      }

      this.profile = await request('/profile/me', {
        token: this.token
      })
      this.user = this.profile.user
      uni.setStorageSync(USER_KEY, this.user)
      return this.profile
    },
    saveSession(data) {
      this.token = data.accessToken
      this.user = data.user
      uni.setStorageSync(TOKEN_KEY, this.token)
      uni.setStorageSync(USER_KEY, this.user)
    },
    logout() {
      this.token = ''
      this.user = null
      this.profile = null
      uni.removeStorageSync(TOKEN_KEY)
      uni.removeStorageSync(USER_KEY)
    }
  }
})
