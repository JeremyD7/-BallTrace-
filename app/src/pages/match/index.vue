<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onHide, onShow } from '@dcloudio/uni-app'
import MatchCard from '@/components/MatchCard.vue'
import { getMatchPosts } from '@/api/matches'
import { subscribeNotifications } from '@/api/messages'

const posts = ref([])
const loading = ref(false)
const hasLoadedOnce = ref(false)
const visiblePosts = computed(() => posts.value)
let matchStream = null

onMounted(loadMatches)
onShow(() => {
  connectMatchStream()

  if (hasLoadedOnce.value) {
    loadMatches()
  }
})
onHide(closeMatchStream)
onUnmounted(closeMatchStream)

async function loadMatches() {
  if (loading.value) {
    return
  }

  loading.value = true

  try {
    const data = await getMatchPosts({
      page: 1,
      pageSize: 20
    })
    posts.value = data?.items || []
  } catch (error) {
    uni.showToast({
      title: error?.message || '约球列表加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    hasLoadedOnce.value = true
  }
}

function isMatchSnapshot(payload) {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      payload.id != null &&
      (Array.isArray(payload.participants) ||
        Object.prototype.hasOwnProperty.call(payload, 'joined') ||
        Object.prototype.hasOwnProperty.call(payload, 'total') ||
        Object.prototype.hasOwnProperty.call(payload, 'schedule'))
  )
}

function extractMatchSnapshot(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (isMatchSnapshot(payload)) {
    return payload
  }

  const wrappedMatch = payload.match
  if (wrappedMatch && typeof wrappedMatch === 'object' && isMatchSnapshot(wrappedMatch)) {
    return wrappedMatch
  }

  const wrappedData = payload.data
  if (wrappedData && typeof wrappedData === 'object') {
    const nestedData = extractMatchSnapshot(wrappedData)
    if (nestedData) {
      return nestedData
    }
  }

  const wrappedPayload = payload.payload
  if (wrappedPayload && typeof wrappedPayload === 'object') {
    const nestedPayload = extractMatchSnapshot(wrappedPayload)
    if (nestedPayload) {
      return nestedPayload
    }
  }

  return null
}

function mergeMatchSnapshot(nextMatch) {
  const matchId = Number(nextMatch?.id)

  if (!Number.isFinite(matchId)) {
    return
  }

  const nextPosts = posts.value.map((item) => {
    if (Number(item.id) !== matchId) {
      return item
    }

    return {
      ...item,
      ...nextMatch,
      id: matchId
    }
  })

  posts.value = nextPosts
}

function handleMatchStreamMessage(message) {
  const snapshot = extractMatchSnapshot(message)

  if (!snapshot) {
    return
  }

  mergeMatchSnapshot(snapshot)
}

function connectMatchStream() {
  // #ifdef H5
  if (matchStream) {
    return
  }

  try {
    matchStream = subscribeNotifications(handleMatchStreamMessage)
  } catch (error) {
    console.warn('约球推送连接失败', error)
  }
  // #endif
}

function closeMatchStream() {
  if (matchStream) {
    matchStream.close()
    matchStream = null
  }
}

function handleCreate() {
  uni.navigateTo({
    url: '/pages/match/create'
  })
}

function handleCardClick(item) {
  uni.navigateTo({
    url: `/pages/match/detail?id=${item.id}`
  })
}

function handleBack() {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // #ifdef H5
    window.location.href = '/#/pages/index/index'
    // #endif
    // #ifndef H5
    uni.switchTab({
      url: '/pages/index/index'
    })
    // #endif
  }
}
</script>

<template>
  <scroll-view class="match-page" scroll-y>
    <view class="match-shell">
      <view class="match-topbar">
        <text class="topbar-back" @click="handleBack">‹</text>
        <text class="topbar-title">约球</text>
        <view class="topbar-action" @click="handleCreate">
          <text class="topbar-action-plus">+</text>
          <text class="topbar-action-text">发布</text>
        </view>
      </view>

      <view class="match-summary">
        <text class="match-summary-text">找到 {{ visiblePosts.length }} 个约球帖</text>
      </view>

      <view class="match-list">
        <MatchCard
          v-for="item in visiblePosts"
          :key="item.id"
          :item="item"
          @click="handleCardClick(item)"
        />
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.match-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.18), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.match-shell {
  padding: 96rpx 28rpx 72rpx;
}

.match-topbar {
  display: grid;
  grid-template-columns: 48rpx 1fr auto;
  align-items: center;
}

.topbar-back {
  color: #f4f4f4;
  font-size: 58rpx;
  line-height: 1;
}

.topbar-title {
  text-align: center;
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.topbar-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.topbar-action-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $brand-color;
  color: #111111;
  font-size: 28rpx;
  font-weight: 700;
}

.topbar-action-text {
  color: $brand-color;
  font-size: 28rpx;
  font-weight: 600;
}

.match-summary {
  margin-top: 56rpx;
}

.match-summary-text {
  color: rgba(244, 244, 244, 0.5);
  font-size: 24rpx;
  letter-spacing: 0.08em;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 22rpx;
}

@media screen and (min-width: 768px) {
  .match-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 64px;
  }

  .match-topbar {
    grid-template-columns: 28px 1fr auto;
  }

  .topbar-back {
    font-size: 38px;
  }

  .topbar-title {
    font-size: 24px;
  }

  .topbar-action {
    gap: 6px;
  }

  .topbar-action-plus {
    width: 26px;
    height: 26px;
    font-size: 18px;
  }

  .topbar-action-text {
    font-size: 16px;
  }

  .match-summary {
    margin-top: 36px;
  }

  .match-summary-text {
    font-size: 14px;
  }

  .match-list {
    gap: 16px;
    margin-top: 16px;
  }
}
</style>
