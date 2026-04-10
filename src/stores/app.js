import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'BallTrace',
    slogan: '记录每一次开球、跑位与相遇',
    stats: [
      { label: '今日活跃球局', value: '128' },
      { label: '附近球场', value: '24' },
      { label: '已加入球队', value: '06' }
    ]
  }),
  actions: {
    updateSlogan(nextSlogan) {
      this.slogan = nextSlogan
    }
  }
})
