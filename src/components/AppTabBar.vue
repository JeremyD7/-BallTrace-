<script setup>
const props = defineProps({
  current: {
    type: String,
    default: 'home'
  }
})

const tabs = [
  {
    key: 'home',
    label: '首页',
    path: '/pages/index/index',
    icon: '/static/images/home.svg',
    activeIcon: '/static/images/home-active.svg'
  },
  {
    key: 'community',
    label: '社区',
    path: '/pages/community/index',
    icon: '/static/images/community.svg',
    activeIcon: '/static/images/community-active.svg'
  },
  {
    key: 'message',
    label: '消息',
    path: '/pages/message/index',
    icon: '/static/images/message.svg',
    activeIcon: '/static/images/message-active.svg'
  },
  {
    key: 'profile',
    label: '个人中心',
    path: '/pages/profile/index',
    icon: '/static/images/mine.svg',
    activeIcon: '/static/images/mine-active.svg'
  }
]

function handleSwitch(tab) {
  if (tab.key === props.current) {
    return
  }

  uni.reLaunch({
    url: tab.path
  })
}
</script>

<template>
  <view class="tabbar-wrap">
    <view class="tabbar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tabbar-item"
        :class="{ 'tabbar-item-active': tab.key === current }"
        @click="handleSwitch(tab)"
      >
        <view class="tabbar-icon">
          <image
            class="tabbar-icon-image"
            :src="tab.key === current ? tab.activeIcon : tab.icon"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>

.tabbar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 0 18rpx calc(env(safe-area-inset-bottom) + 34rpx);
  background: linear-gradient(180deg, rgba(17, 17, 17, 0) 0%, rgba(17, 17, 17, 0.7) 28%, rgba(17, 17, 17, 0.94) 68%, #111111 100%);
}

.tabbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  padding: 16rpx 10rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.16);
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(30, 29, 29, 0.98) 0%, rgba(21, 21, 21, 0.98) 100%);
  box-shadow:
    0 0 0 1rpx rgba(255, 247, 240, 0.04),
    0 18rpx 38rpx rgba(0, 0, 0, 0.34);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 92rpx;
}

.tabbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #434343;
  transition: transform 0.18s ease, background 0.18s ease;
}

.tabbar-icon-image {
  width: 30rpx;
  height: 30rpx;
}

.tabbar-item-active .tabbar-icon {
  background: rgba(217, 122, 63, 0.22);
  transform: translateY(-2rpx);
}

@media screen and (min-width: 768px) {
  .tabbar-wrap {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 24px calc(env(safe-area-inset-bottom) + 28px);
  }

  .tabbar {
    padding: 12px 10px;
    border-radius: 24px;
    border-width: 1px;
    box-shadow:
      0 0 0 1px rgba(255, 247, 240, 0.04),
      0 14px 28px rgba(0, 0, 0, 0.32);
  }

  .tabbar-item {
    min-height: 68px;
  }

  .tabbar-icon {
    width: 38px;
    height: 38px;
  }

  .tabbar-icon-image {
    width: 20px;
    height: 20px;
  }
}
</style>
