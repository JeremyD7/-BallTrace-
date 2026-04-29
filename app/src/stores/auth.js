import { defineStore } from 'pinia'
import { request } from '@/api/request'

const TOKEN_KEY = 'balltrace_token'
const USER_KEY = 'balltrace_user'
const LEGACY_AUTH_KEY = 'balltrace_auth'

function getStoredAuth() {
  const token = uni.getStorageSync(TOKEN_KEY)
  const user = uni.getStorageSync(USER_KEY)

  if (token) {
    return {
      token,
      user: user || null
    }
  }

  const legacyAuth = uni.getStorageSync(LEGACY_AUTH_KEY)

  if (!legacyAuth?.accessToken) {
    return {
      token: '',
      user: user || null
    }
  }

  uni.setStorageSync(TOKEN_KEY, legacyAuth.accessToken)

  if (legacyAuth.user) {
    uni.setStorageSync(USER_KEY, legacyAuth.user)
  }

  return {
    token: legacyAuth.accessToken,
    user: legacyAuth.user || user || null
  }
}

const storedAuth = getStoredAuth()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: storedAuth.token,
    user: storedAuth.user,
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
      uni.removeStorageSync(LEGACY_AUTH_KEY)
    }
  }
})
