<script setup>
defineProps({
  post: {
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
  <view class="post-card" @click="handleClick">
    <view class="post-media" :style="{ background: post.cover }">
      <view class="post-overlay" />
      <view class="post-meta">
        <text class="post-title">{{ post.title }}</text>
        <view class="post-footer">
          <view class="post-author">
            <view class="author-avatar" />
            <text class="author-name">{{ post.author }}</text>
          </view>
          <view class="post-like">
            <text class="like-icon">♥</text>
            <text class="like-count">{{ post.likes }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/uni.scss';

.post-card {
  margin-bottom: 20rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: #1b1a1a;
  box-shadow: 0 16rpx 38rpx rgba(0, 0, 0, 0.22);
}

.post-media {
  position: relative;
  min-height: 340rpx;
  padding: 24rpx;
  display: flex;
  align-items: flex-end;
  background-color: #2a2522;
  background-size: cover;
  background-position: center;
}

.post-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04) 35%, rgba(0, 0, 0, 0.78) 100%);
}

.post-meta {
  position: relative;
  z-index: 1;
  width: 100%;
}

.post-title {
  display: block;
  color: #fff7f0;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.45;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.author-avatar {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $brand-color 0%, #f0b07f 100%);
  box-shadow: 0 0 0 2rpx rgba(255, 247, 240, 0.14);
  flex-shrink: 0;
}

.author-name {
  color: rgba(255, 247, 240, 0.78);
  font-size: 22rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-like {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #fff7f0;
  font-size: 22rpx;
}

.like-icon {
  color: $brand-color;
  font-size: 20rpx;
}

@media screen and (min-width: 768px) {
  .post-card {
    margin-bottom: 16px;
    border-radius: 24px;
  }

  .post-media {
    min-height: 260px;
    padding: 18px;
  }

  .post-title {
    font-size: 18px;
  }

  .post-footer {
    margin-top: 12px;
  }

  .post-author {
    gap: 8px;
  }

  .author-avatar {
    width: 20px;
    height: 20px;
    box-shadow: 0 0 0 1px rgba(255, 247, 240, 0.14);
  }

  .author-name,
  .post-like {
    font-size: 13px;
  }

  .like-icon {
    font-size: 12px;
  }
}
</style>
