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
    <view class="post-media">
      <image class="post-cover" :src="post.cover" mode="aspectFill" />
      <view class="post-overlay" />
      <view class="post-meta">
        <text class="post-title">{{ post.title }}</text>
        <view class="post-footer">
          <view class="post-author">
            <image class="author-avatar" src="/static/images/jeremy.webp" mode="aspectFill" />
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

.post-card {
  margin-bottom: 20rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: #2a2522;
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.2);
}

.post-media {
  position: relative;
  min-height: 460rpx;
  padding: 26rpx 24rpx 24rpx;
  display: flex;
  align-items: flex-end;
  background-color: #2a2522;
  overflow: hidden;
}

.post-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.post-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.08) 26%, rgba(0, 0, 0, 0.74) 100%),
    linear-gradient(180deg, rgba(217, 122, 63, 0.06) 0%, rgba(217, 122, 63, 0) 32%);
}

.post-meta {
  position: relative;
  z-index: 1;
  width: 100%;
  padding-top: 56rpx;
}

.post-title {
  display: block;
  color: #fff7f0;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  gap: 12rpx;
  min-width: 0;
}

.author-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  box-shadow: 0 0 0 1rpx rgba(255, 247, 240, 0.18);
  flex-shrink: 0;
  overflow: hidden;
}

.author-name {
  color: rgba(255, 247, 240, 0.68);
  font-size: 28rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-like {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: rgba(255, 247, 240, 0.68);
  font-size: 24rpx;
}

.like-icon {
  color: rgba(255, 247, 240, 0.6);
  font-size: 22rpx;
}

@media screen and (min-width: 768px) {
  .post-card {
    margin-bottom: 16px;
    border-radius: 24px;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2);
  }

  .post-media {
    min-height: 320px;
    padding: 18px;
  }

  .post-meta {
    padding-top: 36px;
  }

  .post-title {
    font-size: 18px;
  }

  .post-footer {
    margin-top: 14px;
  }

  .post-author {
    gap: 10px;
  }

  .author-avatar {
    width: 24px;
    height: 24px;
    box-shadow: 0 0 0 1px rgba(255, 247, 240, 0.16);
  }

  .author-name,
  .post-like {
    font-size: 15px;
  }

  .like-icon {
    font-size: 13px;
  }
}
</style>
