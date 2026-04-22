<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<template>
  <view class="match-card" @click="handleClick">
    <view class="match-card-top">
      <view class="match-author">
        <image class="match-avatar" :src="item.avatar || '/static/images/jeremy.webp'" mode="aspectFill" />
        <view class="match-author-copy">
          <text class="match-author-name">{{ item.author }}</text>
          <text class="match-author-time">{{ item.time }}</text>
        </view>
      </view>

      <view class="match-status">
        <text class="match-status-text">{{ item.status }}</text>
      </view>
    </view>

    <text class="match-title">{{ item.title }}</text>

    <view class="match-tags">
      <text v-for="tag in item.tags" :key="tag" class="match-tag">{{ tag }}</text>
    </view>

    <view class="match-meta">
      <text class="match-meta-line">{{ item.schedule }}</text>
      <text class="match-meta-line">{{ item.slogan }}</text>
      <text class="match-meta-line">{{ item.location }}</text>
    </view>

    <view class="match-card-bottom">
      <view class="match-capacity">
        <view class="match-avatars">
          <image class="match-mini-avatar" :src="item.avatar || '/static/images/jeremy.webp'" mode="aspectFill" />
          <image class="match-mini-avatar match-mini-avatar-shift" src="/static/images/jeremy.webp" mode="aspectFill" />
        </view>
        <text class="match-capacity-text">{{ item.joined }}/{{ item.total }}</text>
      </view>

      <button class="match-button" hover-class="match-button-hover">
        去报名
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.match-card {
  padding: 28rpx;
  border-radius: 30rpx;
  background:
    linear-gradient(180deg, rgba(41, 39, 38, 0.98) 0%, rgba(30, 28, 27, 0.98) 100%);
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  box-shadow: 0 18rpx 42rpx rgba(0, 0, 0, 0.24);
}

.match-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.match-author {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.match-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.match-author-copy {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.match-author-name {
  color: #fff7f0;
  font-size: 28rpx;
  font-weight: 600;
}

.match-author-time {
  color: rgba(255, 247, 240, 0.46);
  font-size: 22rpx;
}

.match-status {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(198, 220, 85, 0.18);
}

.match-status-text {
  color: #c6dc55;
  font-size: 22rpx;
  font-weight: 700;
}

.match-title {
  display: block;
  margin-top: 22rpx;
  color: #fff7f0;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.45;
}

.match-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.match-tag {
  padding: 8rpx 14rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.16);
  border-radius: 999rpx;
  color: rgba(255, 247, 240, 0.78);
  font-size: 22rpx;
  line-height: 1.2;
}

.match-meta {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 22rpx;
}

.match-meta-line {
  color: rgba(255, 247, 240, 0.62);
  font-size: 24rpx;
  line-height: 1.6;
}

.match-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 26rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 247, 240, 0.08);
}

.match-capacity {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.match-avatars {
  display: flex;
  align-items: center;
}

.match-mini-avatar {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #242323;
}

.match-mini-avatar-shift {
  margin-left: -12rpx;
}

.match-capacity-text {
  color: rgba(255, 247, 240, 0.72);
  font-size: 24rpx;
}

.match-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 144rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border: 0;
  border-radius: 999rpx;
  background: $brand-color;
  color: #111111;
  font-size: 24rpx;
  font-weight: 700;
}

.match-button::after {
  border: 0;
}

.match-button-hover {
  opacity: 0.88;
}

@media screen and (min-width: 768px) {
  .match-card {
    padding: 24px;
    border-radius: 24px;
    border-width: 1px;
  }

  .match-author {
    gap: 12px;
  }

  .match-avatar {
    width: 48px;
    height: 48px;
  }

  .match-author-name {
    font-size: 18px;
  }

  .match-author-time,
  .match-status-text,
  .match-tag,
  .match-capacity-text,
  .match-button {
    font-size: 13px;
  }

  .match-status {
    padding: 6px 12px;
  }

  .match-title {
    margin-top: 16px;
    font-size: 24px;
  }

  .match-tags {
    gap: 8px;
    margin-top: 14px;
  }

  .match-tag {
    padding: 6px 10px;
    border-width: 1px;
  }

  .match-meta {
    gap: 8px;
    margin-top: 16px;
  }

  .match-meta-line {
    font-size: 14px;
  }

  .match-card-bottom {
    margin-top: 18px;
    padding-top: 14px;
    border-top-width: 1px;
  }

  .match-capacity {
    gap: 12px;
  }

  .match-mini-avatar {
    width: 28px;
    height: 28px;
    border-width: 1px;
  }

  .match-mini-avatar-shift {
    margin-left: -8px;
  }

  .match-button {
    min-width: 92px;
    height: 40px;
    padding: 0 16px;
  }
}
</style>
