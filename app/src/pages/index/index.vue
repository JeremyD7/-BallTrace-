<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { useCommunityStore } from '@/stores/community'

const PostWaterfallCard = defineAsyncComponent(() => import('@/components/PostWaterfallCard.vue'))
const INITIAL_POST_RENDER_COUNT = 6
const POST_RENDER_BATCH_SIZE = 4
const communityStore = useCommunityStore()
let cancelDeferredLoad = null
let cancelDeferredRender = null
const preloadedCoverImages = []

const quickActions = [
  {
    key: 'match',
    title: '约球',
    caption: '快速发起一场球局',
    icon: '/static/images/basketball.svg'
  },
  {
    key: 'post',
    title: '发帖',
    caption: '分享战报与球场日常',
    icon: '/static/images/post.svg'
  }
]

const hasLoaded = ref(false)
const renderedPostCount = ref(0)
const posts = ref([])

const loading = computed(() => communityStore.loading)
const visiblePosts = computed(() => posts.value.slice(0, renderedPostCount.value))
const postColumns = computed(() => {
  const columns = [[], []]

  visiblePosts.value.forEach((post, index) => {
    columns[index % 2].push(post)
  })

  return columns
})
const leftPosts = computed(() => postColumns.value[0])
const rightPosts = computed(() => postColumns.value[1])

onMounted(() => {
  const id = setTimeout(() => {
    cancelDeferredLoad = null
    loadPosts()
  }, 0)

  cancelDeferredLoad = () => clearTimeout(id)
})

onUnmounted(() => {
  cancelPendingWork()
})

watch(
  posts,
  (nextPosts) => {
    cancelDeferredRender?.()
    cancelDeferredRender = null

    if (!nextPosts.length) {
      renderedPostCount.value = 0
      return
    }

    renderedPostCount.value = Math.min(nextPosts.length, INITIAL_POST_RENDER_COUNT)

    scheduleRemainingPostRender(nextPosts.length)
  },
  { immediate: true }
)

function deferMainThreadWork(callback, timeout = 0) {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout })
    return () => window.cancelIdleCallback?.(id)
  }

  const id = setTimeout(callback, timeout)
  return () => clearTimeout(id)
}

function cancelPendingWork() {
  cancelDeferredLoad?.()
  cancelDeferredRender?.()
  cancelDeferredLoad = null
  cancelDeferredRender = null
}

function scheduleRemainingPostRender(total) {
  cancelDeferredRender?.()
  cancelDeferredRender = null

  if (renderedPostCount.value >= total) {
    return
  }

  cancelDeferredRender = deferMainThreadWork(() => {
    cancelDeferredRender = null
    renderedPostCount.value = Math.min(total, renderedPostCount.value + POST_RENDER_BATCH_SIZE)
    scheduleRemainingPostRender(total)
  }, 240)
}

async function loadPosts(forceRefresh = false) {
  try {
    const nextPosts = await communityStore.fetchPosts(forceRefresh)
    preloadPostCovers(nextPosts)
    posts.value = Array.isArray(nextPosts) ? nextPosts : []
  } catch (error) {
    uni.showToast({
      title: error?.message || '帖子流加载失败',
      icon: 'none'
    })
  } finally {
    hasLoaded.value = true
  }
}

function getPostCover(post) {
  const mediaList = post?.media || []
  return mediaList[0]?.url || post?.cover || ''
}

function preloadPostCovers(nextPosts = []) {
  if (typeof window === 'undefined' || typeof window.Image === 'undefined' || !Array.isArray(nextPosts)) {
    return
  }

  const images = nextPosts.slice(0, 2).map((post) => {
    const coverUrl = getPostCover(post)

    if (!coverUrl) {
      return null
    }

    const image = new window.Image()
    image.decoding = 'async'
    image.fetchPriority = 'high'
    image.src = coverUrl
    return image
  }).filter(Boolean)

  preloadedCoverImages.splice(0, preloadedCoverImages.length, ...images)
}

async function onRefresh() {
  cancelDeferredLoad?.()
  cancelDeferredLoad = null
  cancelDeferredRender?.()
  cancelDeferredRender = null
  renderedPostCount.value = Math.min(posts.value.length, INITIAL_POST_RENDER_COUNT)

  await loadPosts(true)
  uni.showToast({
    title: '刷新成功',
    icon: 'none'
  })
}

function handleActionClick(action) {
  if (action.key === 'match') {
    uni.navigateTo({
      url: '/pages/match/index'
    })
    return
  }

  if (action.key === 'post') {
    uni.navigateTo({
      url: '/pages/community/create'
    })
    return
  }

  uni.showToast({
    title: `${action.title}功能待接入`,
    icon: 'none'
  })
}

function handlePostClick(post) {
  uni.navigateTo({
    url: `/pages/community/detail?id=${post.id}`
  })
}
</script>

<template>
  <scroll-view
    class="page"
    scroll-y
    refresher-enabled
    :refresher-triggered="loading"
    @refresherrefresh="onRefresh"
  >
    <view class="page-shell">
      <view class="brand-row">
        <image class="brand-logo" src="/static/images/logo-optimized.png" mode="aspectFit" />
        <text class="brand-subtitle">你的篮球生活平台</text>
      </view>

      <view class="action-grid">
        <view v-for="action in quickActions" :key="action.key" class="action-card" @click="handleActionClick(action)">
          <view class="action-icon">
            <image class="action-icon-image" :src="action.icon" mode="aspectFit" />
          </view>
          <text class="action-title">{{ action.title }}</text>
          <text class="action-caption">{{ action.caption }}</text>
        </view>
      </view>

      <view class="section-head">
        <text class="section-title">最新帖子</text>
        <text v-if="loading" class="section-note">加载中...</text>
      </view>

      <view v-if="visiblePosts.length" class="waterfall-grid">
        <view class="waterfall-column">
          <PostWaterfallCard v-for="post in leftPosts" :key="post.id" :post="post" @click="handlePostClick(post)" />
        </view>

        <view class="waterfall-column">
          <PostWaterfallCard v-for="post in rightPosts" :key="post.id" :post="post" @click="handlePostClick(post)" />
        </view>
      </view>

      <view v-else-if="hasLoaded && !loading" class="empty-card">
        <text class="empty-title">暂无帖子</text>
        <text class="empty-copy">稍后再试，或去社区发布第一条内容</text>
      </view>
    </view>

    <AppTabBar current="home" />
  </scroll-view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.22), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.page-shell {
  padding: 96rpx 28rpx 180rpx;
}

.brand-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16rpx;
}

.brand-logo {
  width: 140rpx;
  height: 66rpx;
}

.brand-subtitle {
  color: rgba(255, 247, 240, 0.54);
  font-size: 32rpx;
  line-height: 1.5;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin-top: 42rpx;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190rpx;
  padding: 28rpx 18rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #242323 0%, #1a1918 100%);
  box-shadow: 0 18rpx 36rpx rgba(0, 0, 0, 0.22);
  contain: layout paint;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 247, 240, 0.08);
}

.action-icon-image {
  width: 38rpx;
  height: 38rpx;
}

.action-title {
  margin-top: 18rpx;
  color: #f4f4f4;
  font-size: 32rpx;
  font-weight: 600;
}

.action-caption {
  margin-top: 10rpx;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(244, 244, 244, 0.5);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 54rpx;
  margin-bottom: 24rpx;
}

.section-title {
  color: #d9d9d9;
  font-size: 34rpx;
  font-weight: 600;
}

.section-note {
  color: rgba(244, 244, 244, 0.42);
  font-size: 22rpx;
}

.empty-card {
  margin-top: 28rpx;
  padding: 36rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  background: rgba(36, 35, 35, 0.92);
}

.empty-title {
  display: block;
  color: #f4f4f4;
  font-size: 30rpx;
  font-weight: 600;
}

.empty-copy {
  display: block;
  margin-top: 12rpx;
  color: rgba(244, 244, 244, 0.5);
  font-size: 24rpx;
  line-height: 1.6;
}

.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  align-items: start;
}

.waterfall-column {
  min-width: 0;
}

@media screen and (min-width: 768px) {
  .page-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 140px;
  }

  .brand-row {
    gap: 10px;
  }

  .brand-logo {
    width: 96px;
    height: 45px;
  }

  .brand-subtitle {
    font-size: 18px;
  }

  .action-grid {
    gap: 16px;
    margin-top: 28px;
  }

  .action-card {
    min-height: 160px;
    padding: 24px 18px;
    border-radius: 24px;
  }

  .action-icon {
    width: 52px;
    height: 52px;
  }

  .action-icon-image {
    width: 24px;
    height: 24px;
  }

  .action-title {
    margin-top: 12px;
    font-size: 22px;
  }

  .action-caption {
    margin-top: 8px;
    font-size: 14px;
  }

  .section-head {
    margin-top: 36px;
    margin-bottom: 18px;
  }

  .section-title {
    font-size: 24px;
  }

  .section-note {
    font-size: 13px;
  }

  .waterfall-grid {
    gap: 16px;
  }
}
</style>
