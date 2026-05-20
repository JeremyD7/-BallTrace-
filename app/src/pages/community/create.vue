<script setup>
import { computed, ref } from 'vue'
import { createCommunityPost, uploadCommunityMedia } from '@/api/community'

const title = ref('')
const content = ref('')
const tagsText = ref('')
const visibility = ref('public')
const allowComment = ref(true)
const syncToCommunity = ref(true)
const mediaList = ref([])
const publishing = ref(false)
const uploading = ref(false)

const MAX_IMAGES = 9
const MAX_VIDEOS = 1

const visibilityOptions = [
  {
    key: 'public',
    label: '公开',
    caption: '所有用户可见'
  },
  {
    key: 'followers',
    label: '关注可见',
    caption: '仅关注者可见'
  }
]

const parsedTags = computed(() => {
  return tagsText.value
    .split(/[\s,，#]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
})

const canPublish = computed(() => {
  return (title.value.trim().length > 0 || content.value.trim().length > 0 || mediaList.value.length > 0) && !publishing.value
})

const hasVideo = computed(() => {
  return mediaList.value.some(item => item.type === 'video')
})

const remainingSlots = computed(() => {
  if (hasVideo.value) {
    return 0
  }
  return MAX_IMAGES - mediaList.value.length
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

async function handleChooseMedia() {
  if (hasVideo.value) {
    uni.showToast({
      title: '已选择视频，不能再添加其他媒体',
      icon: 'none'
    })
    return
  }

  if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
    handleWebChooseMedia()
    return
  }

  uni.chooseMedia({
    count: remainingSlots.value,
    mediaType: ['image', 'video'],
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success: async (res) => {
      uploading.value = true
      
      try {
        const tempFiles = res.tempFiles
        const uploadResults = await uploadCommunityMedia(tempFiles)
        
        if (uploadResults.success && uploadResults.data.length > 0) {
          const newMedia = uploadResults.data.map((result, index) => ({
            id: result.filename,
            url: result.url,
            type: result.type,
            localPath: tempFiles[index].tempFilePath
          }))
          mediaList.value = [...mediaList.value, ...newMedia]
        } else {
          uni.showToast({
            title: uploadResults.message || '上传失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
      } finally {
        uploading.value = false
      }
    },
    fail: () => {
      uni.showToast({
        title: '选择媒体失败',
        icon: 'none'
      })
    }
  })
}

function handleWebChooseMedia() {
  const input = document.createElement('input')
  const acceptTypes = hasVideo.value ? 'video/*' : 'image/*'
  
  input.type = 'file'
  input.accept = acceptTypes
  input.multiple = !hasVideo.value && remainingSlots.value > 1
  input.style.display = 'none'
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    uploading.value = true
    
    try {
      const tempFiles = files.map((file) => ({
        tempFilePath: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type
      }))
      
      const uploadResults = await uploadCommunityMediaWeb(files)
      
      if (uploadResults.success && uploadResults.data.length > 0) {
        const newMedia = uploadResults.data.map((result, index) => ({
          id: result.filename,
          url: result.url,
          type: result.type,
          localPath: tempFiles[index].tempFilePath
        }))
        mediaList.value = [...mediaList.value, ...newMedia]
      } else {
        uni.showToast({
          title: uploadResults.message || '上传失败',
          icon: 'none'
        })
      }
    } catch (error) {
      uni.showToast({
        title: error.message || '上传失败',
        icon: 'none'
      })
    } finally {
      uploading.value = false
      document.body.removeChild(input)
    }
  }
  
  document.body.appendChild(input)
  input.click()
}

async function uploadCommunityMediaWeb(files) {
  const token = uni.getStorageSync('balltrace_token') || localStorage.getItem('balltrace_token') || ''
  const BASE_URL = 'http://localhost:3000'
  const results = []
  const errors = []
  
  for (const file of files) {
    const formData = new FormData()
    formData.append('files', file)
    
    try {
      const response = await fetch(`${BASE_URL}/upload/media`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      })
      
      if (!response.ok) {
        errors.push(`HTTP error: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      if (data.success && data.data && data.data.length > 0) {
        results.push(...data.data)
      } else {
        errors.push(data.message || '上传失败')
      }
    } catch (error) {
      errors.push(error.message || '网络错误')
    }
  }
  
  return {
    success: errors.length === 0,
    message: errors.length > 0 ? errors.join('; ') : '上传成功',
    data: results
  }
}

function removeMedia(index) {
  mediaList.value.splice(index, 1)
}

function setVisibility(key) {
  visibility.value = key
}

function toggleAllowComment() {
  allowComment.value = !allowComment.value
}

function toggleSyncToCommunity() {
  syncToCommunity.value = !syncToCommunity.value
}

async function handlePublish() {
  if (publishing.value) {
    return
  }

  if (!title.value.trim()) {
    uni.showToast({
      title: '请输入标题',
      icon: 'none'
    })
    return
  }

  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    })
    return
  }

  const payload = {
    title: title.value.trim(),
    content: content.value.trim(),
    media: mediaList.value.map((item) => ({
      url: item.url,
      type: item.type || 'image'
    })),
    tags: parsedTags.value,
    visibility: visibility.value,
    allowComment: allowComment.value,
    syncToCommunity: syncToCommunity.value
  }

  publishing.value = true

  try {
    const post = await createCommunityPost(payload)
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/community/detail?id=${post.id}`
      })
    }, 300)
  } catch (error) {
    uni.showToast({
      title: error?.message || '发布失败',
      icon: 'none'
    })
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <view class="create-page">
    <scroll-view class="create-scroll" scroll-y>
      <view class="create-shell">
        <view class="topbar">
          <text class="topbar-back" @click="handleBack">‹</text>
          <text class="topbar-title">发布笔记</text>
          <text
            class="topbar-submit"
            :class="{ 'topbar-submit-disabled': !canPublish }"
            @click="handlePublish"
          >
            发布
          </text>
        </view>

        <view class="form-section">
          <text class="section-title">标题</text>
          <view class="input-card input-card-title">
            <input
              v-model="title"
              class="title-input"
              maxlength="40"
              placeholder="给这次球场故事起个标题"
              placeholder-class="input-placeholder"
            />
          </view>
          <text class="field-count">{{ title.length }}/40</text>
        </view>

        <view class="form-section">
          <text class="section-title">内容</text>
          <view class="input-card content-card">
            <textarea
              v-model="content"
              class="content-input"
              maxlength="1000"
              placeholder="分享训练心得、球局感受、装备体验或场地推荐..."
              placeholder-class="input-placeholder"
            />
          </view>
          <text class="field-count">{{ content.length }}/1000</text>
        </view>

        <view class="form-section media-section">
          <view class="section-row">
            <text class="section-title">上传图片或视频</text>
            <text class="section-note">最多9张图片或1个视频</text>
          </view>

          <view class="media-grid">
            <view
              v-for="(item, index) in mediaList"
              :key="item.id || index"
              class="media-item"
            >
              <image v-if="item.type === 'image'" class="media-preview" :src="item.url" mode="aspectFill" />
              <view v-else class="video-preview">
                <image class="video-thumb" :src="item.url" mode="aspectFill" />
                <view class="play-icon">
                  <text class="play-icon-inner">▶</text>
                </view>
              </view>
              <text class="media-remove" @click="removeMedia(index)">×</text>
            </view>

            <view v-if="remainingSlots > 0 && !uploading" class="upload-card" @click="handleChooseMedia">
              <text class="upload-plus">+</text>
              <text class="upload-text">{{ hasVideo ? '添加视频' : '添加媒体' }}</text>
            </view>
            <view v-else-if="uploading" class="upload-card uploading">
              <view class="loading-spinner"></view>
              <text class="upload-text">上传中...</text>
            </view>
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">标签</text>
          <view class="input-card input-card-title">
            <input
              v-model="tagsText"
              class="title-input"
              maxlength="60"
              placeholder="例如：篮球 训练 约球"
              placeholder-class="input-placeholder"
            />
          </view>
          <view v-if="parsedTags.length" class="tag-preview">
            <text v-for="tag in parsedTags" :key="tag" class="tag-item">#{{ tag }}</text>
          </view>
        </view>

        <view class="form-section settings-section">
          <text class="section-title">发布设置</text>

          <view class="visibility-row">
            <view
              v-for="item in visibilityOptions"
              :key="item.key"
              class="visibility-card"
              :class="{ 'visibility-card-active': visibility === item.key }"
              @click="setVisibility(item.key)"
            >
              <text class="visibility-label">{{ item.label }}</text>
              <text class="visibility-caption">{{ item.caption }}</text>
            </view>
          </view>

          <view class="setting-line" @click="toggleAllowComment">
            <view class="setting-copy">
              <text class="setting-title">允许评论</text>
              <text class="setting-caption">开启后用户可以在笔记下互动</text>
            </view>
            <view class="switch" :class="{ 'switch-active': allowComment }">
              <view class="switch-dot" />
            </view>
          </view>

          <view class="setting-line" @click="toggleSyncToCommunity">
            <view class="setting-copy">
              <text class="setting-title">同步到社区流</text>
              <text class="setting-caption">发布后展示在社区推荐列表</text>
            </view>
            <view class="switch" :class="{ 'switch-active': syncToCommunity }">
              <view class="switch-dot" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.2), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 46%, #151311 100%);
}

.create-scroll {
  min-height: 100vh;
}

.create-shell {
  padding: 96rpx 28rpx 80rpx;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-back,
.topbar-submit {
  display: flex;
  align-items: center;
  width: 88rpx;
  height: 56rpx;
}

.topbar-back {
  color: #f4f4f4;
  font-size: 56rpx;
  line-height: 1;
}

.topbar-title {
  flex: 1;
  text-align: center;
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.topbar-submit {
  justify-content: flex-end;
  color: $brand-color;
  font-size: 28rpx;
  font-weight: 700;
}

.topbar-submit-disabled {
  color: rgba(244, 244, 244, 0.36);
}

.form-section {
  margin-top: 36rpx;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: block;
  color: #f4f4f4;
  font-size: 30rpx;
  font-weight: 600;
}

.section-note {
  color: rgba(244, 244, 244, 0.48);
  font-size: 22rpx;
}

.input-card {
  margin-top: 18rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 24rpx;
  background: rgba(36, 35, 35, 0.94);
}

.input-card-title {
  height: 92rpx;
  padding: 0 24rpx;
}

.title-input {
  width: 100%;
  height: 92rpx;
  color: #f4f4f4;
  font-size: 28rpx;
}

.content-card {
  min-height: 260rpx;
  padding: 22rpx 24rpx;
}

.content-input {
  width: 100%;
  min-height: 216rpx;
  color: #f4f4f4;
  font-size: 28rpx;
  line-height: 1.6;
}

.input-placeholder {
  color: rgba(244, 244, 244, 0.38);
}

.field-count {
  display: block;
  margin-top: 10rpx;
  text-align: right;
  color: rgba(244, 244, 244, 0.38);
  font-size: 22rpx;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
  margin-top: 18rpx;
}

.media-item,
.upload-card {
  position: relative;
  width: 204rpx;
  height: 168rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
  border-radius: 22rpx;
  background: #242323;
}

.media-preview {
  width: 100%;
  height: 100%;
}

.video-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-thumb {
  width: 100%;
  height: 100%;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.7);
}

.play-icon-inner {
  color: #f4f4f4;
  font-size: 28rpx;
  margin-left: 4rpx;
}

.media-remove {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.7);
  color: #f4f4f4;
  font-size: 28rpx;
}

.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx dashed rgba(217, 122, 63, 0.42);
  background: rgba(217, 122, 63, 0.1);
}

.upload-plus {
  color: $brand-color;
  font-size: 46rpx;
  font-weight: 600;
  line-height: 1;
}

.upload-text {
  margin-top: 12rpx;
  color: rgba(255, 247, 240, 0.68);
  font-size: 24rpx;
}

.upload-card.uploading {
  pointer-events: none;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(217, 122, 63, 0.3);
  border-top-color: $brand-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tag-preview {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.tag-item {
  margin-right: 14rpx;
  margin-bottom: 10rpx;
  color: $brand-color;
  font-size: 24rpx;
}

.settings-section {
  padding-bottom: 40rpx;
}

.visibility-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  margin-top: 18rpx;
}

.visibility-card {
  width: calc(50% - 8rpx);
  padding: 22rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 24rpx;
  background: rgba(36, 35, 35, 0.94);
}

.visibility-card-active {
  border-color: rgba(217, 122, 63, 0.72);
  background: rgba(217, 122, 63, 0.14);
}

.visibility-label {
  display: block;
  color: #f4f4f4;
  font-size: 27rpx;
  font-weight: 600;
}

.visibility-caption {
  display: block;
  margin-top: 8rpx;
  color: rgba(244, 244, 244, 0.5);
  font-size: 22rpx;
}

.setting-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 24rpx;
  background: rgba(36, 35, 35, 0.94);
}

.setting-copy {
  flex: 1;
  min-width: 0;
  margin-right: 20rpx;
}

.setting-title {
  display: block;
  color: #f4f4f4;
  font-size: 27rpx;
  font-weight: 600;
}

.setting-caption {
  display: block;
  margin-top: 8rpx;
  color: rgba(244, 244, 244, 0.48);
  font-size: 22rpx;
}

.switch {
  position: relative;
  flex-shrink: 0;
  width: 86rpx;
  height: 46rpx;
  border-radius: 999rpx;
  background: rgba(244, 244, 244, 0.18);
}

.switch-dot {
  position: absolute;
  top: 5rpx;
  left: 5rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #f4f4f4;
}

.switch-active {
  background: rgba(217, 122, 63, 0.9);
}

.switch-active .switch-dot {
  left: 45rpx;
}

@media screen and (min-width: 768px) {
  .create-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 70px;
  }

  .topbar-back,
  .topbar-submit {
    width: 72px;
    height: 36px;
  }

  .topbar-back {
    font-size: 38px;
  }

  .topbar-title {
    font-size: 24px;
  }

  .topbar-submit {
    font-size: 16px;
  }

  .form-section {
    margin-top: 28px;
  }

  .section-title {
    font-size: 18px;
  }

  .section-note {
    font-size: 13px;
  }

  .input-card {
    margin-top: 12px;
    border-radius: 18px;
    border-width: 1px;
  }

  .input-card-title,
  .title-input {
    height: 56px;
  }

  .input-card-title {
    padding: 0 16px;
  }

  .title-input,
  .content-input {
    font-size: 16px;
  }

  .content-card {
    min-height: 190px;
    padding: 16px;
  }

  .content-input {
    min-height: 158px;
  }

  .field-count {
    margin-top: 8px;
    font-size: 13px;
  }

  .media-grid {
    margin-top: 12px;
  }

  .media-item,
  .upload-card {
    width: 150px;
    height: 124px;
    margin-right: 12px;
    margin-bottom: 12px;
    border-radius: 16px;
  }

  .upload-plus {
    font-size: 30px;
  }

  .upload-text,
  .tag-item {
    font-size: 14px;
  }

  .visibility-card {
    width: calc(50% - 8px);
    padding: 16px;
    border-radius: 18px;
    border-width: 1px;
  }

  .visibility-label,
  .setting-title {
    font-size: 16px;
  }

  .visibility-caption,
  .setting-caption {
    font-size: 13px;
  }

  .setting-line {
    margin-top: 14px;
    padding: 16px;
    border-radius: 18px;
    border-width: 1px;
  }

  .switch {
    width: 52px;
    height: 28px;
  }

  .switch-dot {
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
  }

  .switch-active .switch-dot {
    left: 27px;
  }
}
</style>
