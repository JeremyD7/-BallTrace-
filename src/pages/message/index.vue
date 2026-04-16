<script setup>
import AppTabBar from '@/components/AppTabBar.vue'
</script>

<template>
  <view class="placeholder-page">
    <view class="placeholder-shell">
      <text class="placeholder-eyebrow">MESSAGE</text>
      <text class="placeholder-title">消息</text>
      <text class="placeholder-copy">这里先放一个静态占位页，后续可以接系统通知、私信会话和互动提醒。</text>
    </view>

    <AppTabBar current="message" />
  </view>
</template>

<style lang="scss" scoped>

.placeholder-page {
  min-height: 100vh;
  padding: 96rpx 28rpx 180rpx;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.22), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.placeholder-shell {
  padding: 44rpx 36rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 32rpx;
  background: linear-gradient(180deg, #242323 0%, #1a1918 100%);
}

.placeholder-eyebrow {
  color: rgba(255, 247, 240, 0.54);
  font-size: 22rpx;
  letter-spacing: 6rpx;
}

.placeholder-title {
  display: block;
  margin-top: 18rpx;
  color: #fff7f0;
  font-size: 52rpx;
  font-weight: 700;
}

.placeholder-copy {
  display: block;
  margin-top: 18rpx;
  color: rgba(255, 247, 240, 0.68);
  font-size: 28rpx;
  line-height: 1.7;
}

@media screen and (min-width: 768px) {
  .placeholder-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 140px;
  }

  .placeholder-shell {
    padding: 32px;
    border-radius: 28px;
    border-width: 1px;
  }

  .placeholder-eyebrow {
    font-size: 12px;
    letter-spacing: 4px;
  }

  .placeholder-title {
    margin-top: 12px;
    font-size: 40px;
  }

  .placeholder-copy {
    margin-top: 14px;
    font-size: 16px;
  }
}
</style>
