<script setup>
function handleJoin() {
  uni.reLaunch({
    url: '/pages/login/index'
  })
}
</script>

<template>
  <view class="launch-page">
    <image class="launch-bg" src="@/static/images/launch-bg-default.jpg" mode="aspectFill" />

    <view class="launch-overlay" />

    <image class="launch-logo" src="@/static/images/logo.png" mode="aspectFit" />

    <view class="launch-copy">
      <text class="launch-title">BALLTRACE球迹派</text>
      <text class="launch-subtitle">你的篮球生活平台</text>
    </view>

    <view class="launch-action">
      <button class="join-button" hover-class="join-button-hover" @click="handleJoin">
        加入球迹派
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>

.launch-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #111111;
}

.launch-bg,
.launch-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.launch-overlay {
  background:
    linear-gradient(180deg, rgba(17, 17, 17, 0.12) 0%, rgba(17, 17, 17, 0.32) 42%, rgba(17, 17, 17, 0.58) 100%);
}

.launch-logo {
  position: absolute;
  top: 56rpx;
  left: 10rpx;
  width: 360rpx;
  height: 108rpx;
}

.launch-copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 312rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 0 40rpx;
  text-align: center;
}

.launch-title {
  color: #ffffff;
  font-family: 'Trebuchet MS', 'Avenir Next', sans-serif;
  font-size: 52rpx;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.36;
}

.launch-subtitle {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.34;
}

.launch-action {
  position: absolute;
  left: 36rpx;
  right: 36rpx;
  bottom: 168rpx;
}

.join-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100rpx;
  padding: 0;
  border: 0;
  border-radius: 20rpx;
  background: $brand-color;
  color: $brand-text-on-color;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.4;
  box-shadow: 0 18rpx 40rpx $brand-shadow-soft;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.join-button::after {
  border: 0;
}

.join-button-hover {
  transform: scale(0.98);
  box-shadow: 0 10rpx 24rpx $brand-shadow-strong;
}

@media screen and (min-width: 768px) {
  .launch-page {
    max-width: 520px;
    min-height: 844px;
    margin: 0 auto;
  }

  .launch-logo {
    top: 55px;
    left: 29px;
    width: 156px;
    height: 68px;
  }

  .launch-copy {
    bottom: 313px;
    gap: 15px;
  }

  .launch-title {
    font-size: 26px;
  }

  .launch-subtitle {
    font-size: 18px;
  }

  .launch-action {
    left: 18px;
    right: 18px;
    bottom: 168px;
  }

  .join-button {
    height: 50px;
    border-radius: 20px;
    font-size: 16px;
  }
}
</style>
