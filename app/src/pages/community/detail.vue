<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  createCommunityComment,
  getCommunityPostComments,
  getCommunityPostDetail,
  likeCommunityPost
} from '@/api/community'

const postId = ref('1')
const commentText = ref('')
const post = ref(null)
const comments = ref([])
const commentsLoaded = ref(false)
const currentMediaIndex = ref(0)
const loading = ref(false)
const videoPlaying = ref(false)

const currentPost = computed(() => post.value)
const commentList = computed(() => (commentsLoaded.value ? comments.value : []))
const mediaList = computed(() => currentPost.value?.media || [])
const hasMedia = computed(() => mediaList.value.length > 0)
const currentMedia = computed(() => mediaList.value[currentMediaIndex.value])
const isVideo = computed(() => currentMedia.value?.type === 'video')
const imageCount = computed(() => mediaList.value.filter(m => m.type === 'image').length)
const hasMultipleMedia = computed(() => mediaList.value.length > 1)

onLoad((query) => {
  if (query?.id) {
    postId.value = String(query.id)
  }
  loadDetail()
})

async function loadDetail() {
  loading.value = true

  try {
    const [postData, commentData] = await Promise.all([
      getCommunityPostDetail(postId.value),
      getCommunityPostComments(postId.value)
    ])
    post.value = postData
    comments.value = commentData || []
    commentsLoaded.value = true
    currentMediaIndex.value = 0
  } catch (error) {
    uni.showToast({
      title: error?.message || '帖子详情加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

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

function handleMediaChange(event) {
  currentMediaIndex.value = event?.detail?.current || 0
  videoPlaying.value = false
}

function handleVideoPlay() {
  videoPlaying.value = true
}

function handleVideoPause() {
  videoPlaying.value = false
}

async function handleLike() {
  try {
    const result = await likeCommunityPost(postId.value)
    if (post.value) {
      post.value = {
        ...post.value,
        likes: result.likes,
        isLiked: result.isLiked
      }
    }
  } catch (error) {
    uni.showToast({
      title: error?.message || '点赞失败',
      icon: 'none'
    })
  }
}

function handleCollect() {
  uni.showToast({
    title: '收藏功能待接入',
    icon: 'none'
  })
}

async function handleSubmitComment() {
  if (!commentText.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }

  try {
    await createCommunityComment(postId.value, {
      content: commentText.value.trim()
    })
    commentText.value = ''
    const nextComments = await getCommunityPostComments(postId.value)
    comments.value = nextComments || []
    commentsLoaded.value = true
    if (post.value) {
      post.value = {
        ...post.value,
        comments: post.value.comments + 1
      }
    }
  } catch (error) {
    uni.showToast({
      title: error?.message || '评论发布失败',
      icon: 'none'
    })
  }
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

        <view v-if="loading && !currentPost" class="empty-card">
          <text class="empty-title">帖子加载中</text>
          <text class="empty-copy">正在获取最新内容...</text>
        </view>

        <view v-else-if="!currentPost" class="empty-card">
          <text class="empty-title">帖子不存在</text>
          <text class="empty-copy">请返回列表重新选择</text>
        </view>

        <template v-else>
          <view class="author-row">
            <image class="author-avatar" :src="currentPost.author?.avatar" mode="aspectFill" />
            <view class="author-copy">
              <text class="author-name">{{ currentPost.author?.name }}</text>
              <text class="post-time">{{ currentPost.publishedAt }}</text>
            </view>
          </view>

          <view v-if="hasMedia" class="media-card">
            <swiper
              class="media-swiper"
              :current="currentMediaIndex"
              circular
              :indicator-dots="false"
              @change="handleMediaChange"
            >
              <swiper-item v-for="(media, index) in mediaList" :key="`${media.url}-${index}`">
                <view class="media-container">
                  <image v-if="media.type === 'image'" class="media-image" :src="media.url" mode="aspectFill" />
                  <view v-else class="video-container">
                    <video
                      class="media-video"
                      :src="media.url"
                      autoplay
                      loop
                      muted
                      :controls="false"
                      show-center-play-btn="false"
                      @play="handleVideoPlay"
                      @pause="handleVideoPause"
                    />
                    <view v-if="!videoPlaying" class="video-overlay" @click="handleVideoPlay">
                      <view class="video-play-btn">
                        <text class="play-icon">▶</text>
                      </view>
                    </view>
                  </view>
                </view>
              </swiper-item>
            </swiper>
            <view v-if="hasMultipleMedia" class="media-indicator">
              <text class="indicator-text">{{ currentMediaIndex + 1 }}/{{ mediaList.length }}</text>
            </view>
          </view>

          <view class="content-section">
            <text class="post-title">{{ currentPost.title }}</text>
            <text class="post-content">{{ currentPost.content }}</text>
            <view v-if="Array.isArray(currentPost.tags) && currentPost.tags.length" class="tag-row">
              <text v-for="tag in currentPost.tags" :key="tag" class="tag-item">#{{ tag }}</text>
            </view>
            <view class="meta-row">
              <text class="meta-text">{{ currentPost.location }}</text>
              <text class="meta-dot">·</text>
              <text class="meta-text">帖子 ID {{ postId }}</text>
            </view>
          </view>

          <view class="divider" />

          <view class="comment-header">
            <text class="comment-title">共{{ currentPost.comments || 0 }}条评论</text>
          </view>

          <view v-if="commentList.length" class="comment-list">
            <view v-for="comment in commentList" :key="comment.id" class="comment-card">
              <view class="comment-main">
                <image class="comment-avatar" :src="comment.author?.avatar" mode="aspectFill" />
                <view class="comment-copy">
                  <view class="comment-top">
                    <text class="comment-name">{{ comment.author?.name }}</text>
                    <text class="comment-time">{{ comment.publishedAt }}</text>
                  </view>
                  <text class="comment-content">{{ comment.content }}</text>
                  <view v-if="comment.replies?.length" class="reply-box">
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
        </template>
      </view>
    </scroll-view>

    <view v-if="currentPost" class="bottom-bar">
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
          <text class="bottom-count">{{ currentPost.likes || 0 }}</text>
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

.empty-card {
  margin-top: 54rpx;
  padding: 36rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  background: rgba(36, 35, 35, 0.92);
}

.empty-title {
  display: block;
  color: #f4f4f4;
  font-size: 30rpx;
  font-weight: 600;
}

.empty-copy {
  display: block;
  margin-top: 12rpx;
  color: rgba(244, 244, 244, 0.5);
  font-size: 24rpx;
  line-height: 1.6;
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

.media-card {
  position: relative;
  margin-top: 36rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: #1a1a1a;
}

.media-swiper {
  width: 100%;
  height: 750rpx;
}

.media-container {
  width: 100%;
  height: 100%;
}

.media-image {
  width: 100%;
  height: 100%;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.video-play-btn {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(244, 244, 244, 0.9);
}

.video-play-btn .play-icon {
  color: #1a1a1a;
  font-size: 40rpx;
  margin-left: 8rpx;
}

.media-indicator {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.6);
}

.indicator-text {
  color: #f4f4f4;
  font-size: 24rpx;
  font-weight: 500;
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
