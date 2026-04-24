<script setup>
import MatchCard from '@/components/MatchCard.vue'
import { matchPosts } from '@/pages/data/matches'

function handleCreate() {
  uni.showToast({
    title: '发布约球待接入',
    icon: 'none'
  })
}

function handleCardClick(item) {
  uni.navigateTo({
    url: `/pages/match/detail?id=${item.id}`
  })
}

function handleBack() {
  uni.navigateBack({
    fail() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  })
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
        <text class="match-summary-text">找到 {{ matchPosts.length }} 个约球帖</text>
      </view>

      <view class="match-list">
        <MatchCard
          v-for="item in matchPosts"
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
