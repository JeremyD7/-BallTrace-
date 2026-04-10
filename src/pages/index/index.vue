<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const cards = computed(() => [
  {
    title: 'H5 与移动端共用',
    description: '基于 uni-app + Vue 3 + Vite，页面与状态逻辑一套维护。'
  },
  {
    title: 'Pinia 已接入',
    description: `当前站点文案来自 Pinia：${appStore.slogan}`
  },
  {
    title: '适合继续扩展',
    description: '下一步可以直接接接口、加分包、接入地图与登录能力。'
  }
])
</script>

<template>
  <view class="page">
    <view class="hero">
      <text class="eyebrow">BALLTRACE</text>
      <text class="title">{{ appStore.title }}</text>
      <text class="subtitle">{{ appStore.slogan }}</text>
    </view>

    <view class="panel stats-panel">
      <view
        v-for="item in appStore.stats"
        :key="item.label"
        class="stat-card"
      >
        <text class="stat-value">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="panel">
      <view
        v-for="card in cards"
        :key="card.title"
        class="feature-card"
      >
        <text class="feature-title">{{ card.title }}</text>
        <text class="feature-desc">{{ card.description }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 28rpx 64rpx;
  background:
    radial-gradient(circle at top right, rgba(217, 108, 40, 0.22), transparent 32%),
    linear-gradient(180deg, #f5efe6 0%, #efe4d5 100%);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 44rpx 34rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #241f1c 0%, #4b2f1f 100%);
  color: #fffaf5;
  box-shadow: 0 24rpx 60rpx rgba(36, 31, 28, 0.18);
}

.eyebrow {
  font-size: 22rpx;
  letter-spacing: 6rpx;
  opacity: 0.72;
}

.title {
  font-size: 64rpx;
  font-weight: 700;
  line-height: 1;
}

.subtitle {
  max-width: 560rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: rgba(255, 250, 245, 0.84);
}

.panel {
  margin-top: 28rpx;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx;
}

.stat-card,
.feature-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(29, 29, 31, 0.08);
  border-radius: 28rpx;
  background: rgba(255, 248, 239, 0.88);
  backdrop-filter: blur(16rpx);
}

.stat-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #d96c28;
}

.stat-label {
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(29, 29, 31, 0.7);
}

.feature-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1d1d1f;
}

.feature-desc {
  font-size: 26rpx;
  line-height: 1.7;
  color: rgba(29, 29, 31, 0.76);
}

@media screen and (min-width: 768px) {
  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 72px;
  }

  .hero {
    padding: 40px;
    border-radius: 28px;
  }

  .eyebrow {
    font-size: 12px;
    letter-spacing: 4px;
  }

  .title {
    font-size: 56px;
  }

  .subtitle {
    max-width: 520px;
    font-size: 18px;
  }

  .panel {
    margin-top: 20px;
  }

  .stats-panel {
    gap: 16px;
  }

  .stat-card,
  .feature-card {
    padding: 24px;
    border-radius: 24px;
  }

  .stat-value {
    font-size: 32px;
  }

  .stat-label {
    font-size: 14px;
  }

  .feature-title {
    font-size: 22px;
  }

  .feature-desc {
    font-size: 15px;
  }
}
</style>
