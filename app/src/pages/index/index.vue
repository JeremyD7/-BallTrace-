<script setup>
import { computed, onMounted, ref } from 'vue'
import AppTabBar from '@/components/AppTabBar.vue'
import PostWaterfallCard from '@/components/PostWaterfallCard.vue'
import { useCommunityStore } from '@/stores/community'

const communityStore = useCommunityStore()

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

const posts = computed(() => communityStore.posts)
const loading = computed(() => communityStore.loading)
const visiblePosts = computed(() => posts.value)
const leftPosts = computed(() => visiblePosts.value.filter((_, index) => index % 2 === 0))
const rightPosts = computed(() => visiblePosts.value.filter((_, index) => index % 2 === 1))

onMounted(loadPosts)

async function loadPosts(forceRefresh = false) {
  try {
    await communityStore.fetchPosts(forceRefresh)
  } catch (error) {
    uni.showToast({
      title: error?.message || '帖子流加载失败',
      icon: 'none'
    })
  } finally {
    hasLoaded.value = true
  }
}

async function onRefresh() {
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
        <image class="brand-logo" src="@/static/images/logo.png" mode="aspectFit" />
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
