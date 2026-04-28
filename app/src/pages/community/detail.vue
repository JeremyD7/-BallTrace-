<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const postId = ref('1')
const commentText = ref('')

const defaultPost = {
  id: 2,
  title: '今天打球心得分享',
  content:
    '今天在锦江网球场打了两个小时，感觉状态特别好！正手击球的旋转控制有了很大进步。\n\n分享几个心得：\n1. 击球时要保持放松，不要过分用力。\n2. 注意脚步移动，提前到位。\n3. 击球点要在身体前方。\n\n希望对大家有帮助！',
  author: {
    id: 101,
    name: '张三',
    avatar: '/static/images/theman02.jpg'
  },
  coverImages: [
    '/static/images/art_theman.jpg',
    '/static/images/art_frommoon.jpg',
    '/static/images/earth.jpg'
  ],
  currentImageIndex: 0,
  likes: 218,
  comments: 8,
  shares: 12,
  isLiked: false,
  tags: ['训练', '心得', '正手'],
  publishedAt: '2024-01-15 10:30',
  location: '锦江网球场'
}

const defaultComments = [
  {
    id: 1,
    author: {
      id: 201,
      name: '李娜',
      avatar: '/static/images/art_thewoman.jpg'
    },
    content: '脚步提前到位真的很关键，我最近也在练这个。',
    likes: 16,
    publishedAt: '12分钟前',
    replies: [
      {
        id: 11,
        authorName: '张三',
        content: '是的，提前半拍会轻松很多。'
      }
    ]
  },
  {
    id: 2,
    author: {
      id: 202,
      name: 'Ace慢热',
      avatar: '/static/images/jeremy.webp'
    },
    content: '正手放松这一点太真实了，越想发力越容易打飞。',
    likes: 9,
    publishedAt: '35分钟前',
    replies: []
  },
  {
    id: 3,
    author: {
      id: 203,
      name: '落点实验室',
      avatar: '/static/images/art_frommoon.jpg'
    },
    content: '下次可以试试用小目标练落点，效果很明显。',
    likes: 7,
    publishedAt: '1小时前',
    replies: []
  }
]

const activeCover = computed(() => defaultPost.coverImages[defaultPost.currentImageIndex])

onLoad((query) => {
  if (query?.id) {
    postId.value = String(query.id)
  }
})

function handleBack() {
  uni.navigateBack({
    fail() {
      uni.reLaunch({
        url: '/pages/community/index'
      })
    }
  })
}

function handleShare() {
  uni.showToast({
    title: '分享功能待接入',
    icon: 'none'
  })
}

function handleLike() {
  uni.showToast({
    title: '点赞接口待接入',
    icon: 'none'
  })
}

function handleCollect() {
  uni.showToast({
    title: '收藏功能待接入',
    icon: 'none'
  })
}

function handleSubmitComment() {
  if (!commentText.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '评论发布待接入',
    icon: 'none'
  })
  commentText.value = ''
}
</script>

<template>
  <view class="detail-page">
    <scroll-view class="detail-scroll" scroll-y>
      <view class="detail-shell">
        <view class="topbar">
          <text class="topbar-back" @click="handleBack">‹</text>
          <text class="topbar-title">帖子详情</text>
          <text class="topbar-share" @click="handleShare">↗</text>
        </view>

        <view class="author-row">
          <image class="author-avatar" :src="defaultPost.author.avatar" mode="aspectFill" />
          <view class="author-copy">
            <text class="author-name">{{ defaultPost.author.name }}</text>
            <text class="post-time">{{ defaultPost.publishedAt }}</text>
          </view>
        </view>

        <view class="cover-card">
          <image class="cover-image" :src="activeCover" mode="aspectFill" />
          <view class="cover-dots">
            <view
              v-for="(_, index) in defaultPost.coverImages"
              :key="index"
              class="cover-dot"
              :class="{ 'cover-dot-active': index === defaultPost.currentImageIndex }"
            />
          </view>
        </view>

        <view class="content-section">
          <text class="post-title">{{ defaultPost.title }}</text>
          <text class="post-content">{{ defaultPost.content }}</text>
          <view class="tag-row">
            <text v-for="tag in defaultPost.tags" :key="tag" class="tag-item">#{{ tag }}</text>
          </view>
          <view class="meta-row">
            <text class="meta-text">{{ defaultPost.location }}</text>
            <text class="meta-dot">·</text>
            <text class="meta-text">帖子 ID {{ postId }}</text>
          </view>
        </view>

        <view class="divider" />

        <view class="comment-header">
          <text class="comment-title">共{{ defaultPost.comments }}条评论</text>
        </view>

        <view class="comment-list">
          <view v-for="comment in defaultComments" :key="comment.id" class="comment-card">
            <view class="comment-main">
              <image class="comment-avatar" :src="comment.author.avatar" mode="aspectFill" />
              <view class="comment-copy">
                <view class="comment-top">
                  <text class="comment-name">{{ comment.author.name }}</text>
                  <text class="comment-time">{{ comment.publishedAt }}</text>
                </view>
                <text class="comment-content">{{ comment.content }}</text>
                <view v-if="comment.replies.length" class="reply-box">
                  <text
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="reply-text"
                  >
                    {{ reply.authorName }}：{{ reply.content }}
                  </text>
                </view>
              </view>
            </view>
            <view class="comment-actions">
              <text class="comment-like">♥ {{ comment.likes }}</text>
              <text class="comment-reply">回复</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="comment-input-wrap">
        <input
          v-model="commentText"
          class="comment-input"
          confirm-type="send"
          placeholder="说点什么..."
          placeholder-class="comment-placeholder"
          @confirm="handleSubmitComment"
        />
      </view>
      <view class="bottom-actions">
        <view class="bottom-action" @click="handleLike">
          <text class="bottom-icon">♥</text>
          <text class="bottom-count">{{ defaultPost.likes }}</text>
        </view>
        <view class="bottom-action" @click="handleCollect">
          <text class="bottom-icon">★</text>
        </view>
        <view class="send-action" @click="handleSubmitComment">
          <text class="send-text">发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.2), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 46%, #151311 100%);
}

.detail-scroll {
  min-height: 100vh;
}

.detail-shell {
  padding: 96rpx 28rpx 190rpx;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-back,
.topbar-share {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  color: #f4f4f4;
  font-size: 48rpx;
  line-height: 1;
}

.topbar-share {
  font-size: 32rpx;
}

.topbar-title {
  flex: 1;
  text-align: center;
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.author-row {
  display: flex;
  align-items: center;
  margin-top: 54rpx;
}

.author-avatar,
.comment-avatar {
  flex-shrink: 0;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #34302d;
  box-shadow: 0 0 0 1rpx rgba(255, 247, 240, 0.14);
}

.author-copy {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.author-name {
  display: block;
  color: #f4f4f4;
  font-size: 28rpx;
  font-weight: 600;
}

.post-time {
  display: block;
  margin-top: 6rpx;
  color: rgba(244, 244, 244, 0.48);
  font-size: 23rpx;
}

.cover-card {
  position: relative;
  height: 690rpx;
  margin-top: 36rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 32rpx;
  background: #242323;
  box-shadow: 0 20rpx 44rpx rgba(0, 0, 0, 0.24);
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-dots {
  position: absolute;
  right: 0;
  bottom: 26rpx;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-dot {
  width: 12rpx;
  height: 12rpx;
  margin: 0 8rpx;
  border-radius: 50%;
  background: rgba(255, 247, 240, 0.42);
}

.cover-dot-active {
  background: $brand-color;
}

.content-section {
  margin-top: 34rpx;
}

.post-title {
  display: block;
  color: #fff7f0;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.35;
}

.post-content {
  display: block;
  margin-top: 24rpx;
  color: rgba(244, 244, 244, 0.82);
  font-size: 28rpx;
  line-height: 1.78;
  white-space: pre-line;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  margin-top: 22rpx;
}

.tag-item {
  margin-right: 16rpx;
  margin-bottom: 10rpx;
  color: $brand-color;
  font-size: 25rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.meta-text,
.meta-dot {
  color: rgba(244, 244, 244, 0.42);
  font-size: 23rpx;
}

.meta-dot {
  margin: 0 10rpx;
}

.divider {
  height: 1rpx;
  margin-top: 34rpx;
  background: rgba(255, 247, 240, 0.1);
}

.comment-header {
  margin-top: 30rpx;
}

.comment-title {
  color: #f4f4f4;
  font-size: 30rpx;
  font-weight: 600;
}

.comment-list {
  margin-top: 20rpx;
}

.comment-card {
  padding: 26rpx;
  margin-bottom: 18rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 28rpx;
  background: rgba(36, 35, 35, 0.92);
}

.comment-main {
  display: flex;
  align-items: flex-start;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
}

.comment-copy {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.comment-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-name {
  color: #f4f4f4;
  font-size: 27rpx;
  font-weight: 600;
}

.comment-time {
  flex-shrink: 0;
  margin-left: 16rpx;
  color: rgba(244, 244, 244, 0.42);
  font-size: 22rpx;
}

.comment-content {
  display: block;
  margin-top: 10rpx;
  color: rgba(244, 244, 244, 0.72);
  font-size: 25rpx;
  line-height: 1.55;
}

.reply-box {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 247, 240, 0.055);
}

.reply-text {
  display: block;
  color: rgba(244, 244, 244, 0.66);
  font-size: 24rpx;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16rpx;
}

.comment-like,
.comment-reply {
  margin-left: 24rpx;
  color: rgba(244, 244, 244, 0.5);
  font-size: 23rpx;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 18rpx);
  border-top: 1rpx solid rgba(255, 247, 240, 0.08);
  background: rgba(24, 23, 22, 0.98);
  box-shadow: 0 -18rpx 38rpx rgba(0, 0, 0, 0.32);
}

.comment-input-wrap {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 247, 240, 0.08);
}

.comment-input {
  width: 100%;
  height: 72rpx;
  color: #f4f4f4;
  font-size: 26rpx;
}

.comment-placeholder {
  color: rgba(244, 244, 244, 0.44);
}

.bottom-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.bottom-action,
.send-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 58rpx;
  height: 58rpx;
  margin-left: 10rpx;
}

.bottom-icon {
  color: $brand-color;
  font-size: 28rpx;
}

.bottom-count {
  margin-left: 5rpx;
  color: rgba(244, 244, 244, 0.66);
  font-size: 22rpx;
}

.send-action {
  min-width: 78rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: $brand-color;
}

.send-text {
  color: #111111;
  font-size: 24rpx;
  font-weight: 700;
}

@media screen and (min-width: 768px) {
  .detail-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 128px;
  }

  .topbar-back,
  .topbar-share {
    width: 36px;
    height: 36px;
    font-size: 34px;
  }

  .topbar-share {
    font-size: 22px;
  }

  .topbar-title {
    font-size: 24px;
  }

  .author-row {
    margin-top: 36px;
  }

  .author-avatar {
    width: 52px;
    height: 52px;
  }

  .author-copy {
    margin-left: 14px;
  }

  .author-name {
    font-size: 17px;
  }

  .post-time {
    margin-top: 4px;
    font-size: 13px;
  }

  .cover-card {
    height: 520px;
    margin-top: 24px;
    border-radius: 24px;
    border-width: 1px;
  }

  .cover-dots {
    bottom: 18px;
  }

  .cover-dot {
    width: 8px;
    height: 8px;
    margin: 0 5px;
  }

  .content-section {
    margin-top: 24px;
  }

  .post-title {
    font-size: 24px;
  }

  .post-content {
    margin-top: 16px;
    font-size: 16px;
  }

  .tag-item {
    margin-right: 10px;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .meta-text,
  .meta-dot {
    font-size: 13px;
  }

  .divider {
    height: 1px;
    margin-top: 24px;
  }

  .comment-header {
    margin-top: 22px;
  }

  .comment-title {
    font-size: 18px;
  }

  .comment-list {
    margin-top: 16px;
  }

  .comment-card {
    padding: 18px;
    margin-bottom: 14px;
    border-radius: 22px;
    border-width: 1px;
  }

  .comment-avatar {
    width: 42px;
    height: 42px;
  }

  .comment-copy {
    margin-left: 12px;
  }

  .comment-name {
    font-size: 16px;
  }

  .comment-time {
    margin-left: 12px;
    font-size: 13px;
  }

  .comment-content {
    margin-top: 8px;
    font-size: 14px;
  }

  .reply-box {
    margin-top: 12px;
    padding: 12px;
    border-radius: 14px;
  }

  .reply-text,
  .comment-like,
  .comment-reply {
    font-size: 13px;
  }

  .bottom-bar {
    max-width: 960px;
    margin: 0 auto;
    padding: 12px 24px calc(env(safe-area-inset-bottom) + 12px);
    border-width: 1px;
  }

  .comment-input-wrap,
  .comment-input {
    height: 44px;
  }

  .comment-input-wrap {
    padding: 0 16px;
  }

  .comment-input {
    font-size: 14px;
  }

  .bottom-actions {
    margin-left: 12px;
  }

  .bottom-action,
  .send-action {
    min-width: 40px;
    height: 40px;
    margin-left: 8px;
  }

  .bottom-icon {
    font-size: 18px;
  }

  .bottom-count {
    font-size: 13px;
  }

  .send-action {
    min-width: 58px;
    padding: 0 14px;
  }

  .send-text {
    font-size: 14px;
  }
}
</style>
