import { defineStore } from 'pinia'
import { getCommunityFeed } from '@/api/community'

const CACHE_DURATION = 5 * 60 * 1000

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [],
    lastFetchTime: 0,
    loading: false,
    fetching: false
  }),

  getters: {
    hasCache: (state) => state.posts.length > 0,
    isCacheExpired: (state) => Date.now() - state.lastFetchTime > CACHE_DURATION
  },

  actions: {
    async fetchPosts(forceRefresh = false) {
      if (this.fetching) {
        return this.posts
      }

      if (!forceRefresh && this.hasCache && !this.isCacheExpired) {
        return this.posts
      }

      this.fetching = true
      this.loading = true
      try {
        const data = await getCommunityFeed({ tab: 'latest', pageSize: 20 })
        this.posts = data?.items || []
        this.lastFetchTime = Date.now()
        return this.posts
      } finally {
        this.fetching = false
        this.loading = false
      }
    },

    clearCache() {
      this.posts = []
      this.lastFetchTime = 0
    }
  }
})
