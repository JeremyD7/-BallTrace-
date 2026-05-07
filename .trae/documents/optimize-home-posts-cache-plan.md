# 首页帖子缓存优化计划

## 问题分析

### 当前问题
每次从Tab栏进入首页都会重新请求帖子数据，原因：

1. **Tab栏使用 `uni.reLaunch`**：[AppTabBar.vue:45](file:///c:/Users/14187/Desktop/-BallTrace-/app/src/components/AppTabBar.vue#L45) 使用 `uni.reLaunch` 切换页面，导致页面完全重新加载
2. **每次挂载都请求数据**：[index/index.vue:30](file:///c:/Users/14187/Desktop/-BallTrace-/app/src/pages/index/index.vue#L30) `onMounted(loadPosts)` 每次页面挂载都会请求
3. **没有数据缓存**：帖子数据存储在组件的 `ref` 中，页面重新加载后数据丢失

### 当前架构
- **首页**: `app/src/pages/index/index.vue` - 使用本地 `ref` 存储帖子
- **Tab栏**: `app/src/components/AppTabBar.vue` - 使用 `uni.reLaunch` 切换页面
- **App Store**: `app/src/stores/app.js` - 已存在但未用于缓存帖子

## 实现方案

### 方案：使用 Pinia Store 缓存帖子数据

将帖子数据存储到 Pinia store 中，实现跨页面缓存。

### 修改内容

1. **创建社区 Store** (`app/src/stores/community.js`)
   - 存储帖子列表数据
   - 记录加载状态和最后加载时间
   - 提供缓存过期判断

2. **修改首页** (`app/src/pages/index/index.vue`)
   - 从 store 获取帖子数据
   - 仅在无缓存或缓存过期时请求

3. **添加下拉刷新**（可选）
   - 用户可手动刷新帖子

## 详细步骤

### 步骤 1：创建社区 Store

新建 `app/src/stores/community.js`：

```javascript
import { defineStore } from 'pinia'
import { getCommunityFeed } from '@/api/community'

const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [],
    lastFetchTime: 0,
    loading: false
  }),
  
  getters: {
    hasCache: (state) => state.posts.length > 0,
    isCacheExpired: (state) => Date.now() - state.lastFetchTime > CACHE_DURATION
  },
  
  actions: {
    async fetchPosts(forceRefresh = false) {
      if (!forceRefresh && this.hasCache && !this.isCacheExpired) {
        return this.posts
      }
      
      this.loading = true
      try {
        const data = await getCommunityFeed({ tab: 'latest', pageSize: 20 })
        this.posts = data?.items || []
        this.lastFetchTime = Date.now()
        return this.posts
      } finally {
        this.loading = false
      }
    },
    
    clearCache() {
      this.posts = []
      this.lastFetchTime = 0
    }
  }
})
```

### 步骤 2：修改首页

修改 `app/src/pages/index/index.vue`：

- 引入 `useCommunityStore`
- 从 store 获取帖子数据
- 添加下拉刷新功能

### 步骤 3：在 main.js 中注册 store

确保新 store 正确注册。

## 预期结果

- 首次进入首页：请求帖子数据
- Tab切换回首页：使用缓存数据，不重新请求
- 缓存过期后：自动请求新数据
- 下拉刷新：强制请求新数据

## 缓存策略

| 场景 | 行为 |
|------|------|
| 首次进入 | 请求数据 |
| 5分钟内返回 | 使用缓存 |
| 超过5分钟 | 重新请求 |
| 下拉刷新 | 强制请求 |

---

**计划状态**: 待审批