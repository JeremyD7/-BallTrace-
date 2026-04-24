<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppTabBar from '@/components/AppTabBar.vue'

const AUTH_STORAGE_KEY = 'balltrace_auth'
const activeTab = ref('posts')
const profileNickname = ref('球友')

const stats = [
  { label: '获赞与收藏', value: '2.3k' },
  { label: '关注', value: '128' },
  { label: '粉丝', value: '482' }
]

const tags = ['篮球日常', '夜场爱好者', '周末约球', '投篮训练']

const posts = [
  {
    id: 1,
    cover: '/static/images/art_theman.jpg'
  },
  {
    id: 2,
    cover: '/static/images/art_thewoman.jpg'
  },
  {
    id: 3,
    cover: '/static/images/art_frommoon.jpg'
  },
  {
    id: 4,
    cover: '/static/images/art002e009007~large.jpg'
  },
  {
    id: 5,
    cover: '/static/images/art_thewoman.jpg'
  },
  {
    id: 6,
    cover: '/static/images/art_theman.jpg'
  }
]

function loadProfileFromStorage() {
  const authSession = uni.getStorageSync(AUTH_STORAGE_KEY)
  const user = authSession?.user || {}

  profileNickname.value = user.nickname || user.account || '球友'
}

onShow(() => {
  loadProfileFromStorage()
})

function handleEditProfile() {
  uni.showToast({
    title: '编辑资料功能待接入',
    icon: 'none'
  })
}

function handleTabChange(tab) {
  activeTab.value = tab
}

function handlePostClick() {
  uni.showToast({
    title: '帖子详情待接入',
    icon: 'none'
  })
}
</script>

<template>
  <scroll-view class="profile-page" scroll-y>
    <view class="profile-shell">
      <view class="profile-topbar">
        <text class="page-title">我的</text>
      </view>

      <view class="profile-header">
        <image class="profile-avatar" src="/static/images/jeremy.webp" mode="aspectFill" />

        <view class="profile-main">
          <view class="profile-row">
            <text class="profile-name">{{ profileNickname }}</text>
            <text class="profile-edit" @click="handleEditProfile">编辑</text>
            <view class="profile-badge">
              <text class="profile-badge-text">Lv.2</text>
            </view>
          </view>

          <text class="profile-id">BALLTRACE 号：evan_24</text>
          <text class="profile-bio">生命不息，运动不止。记录每一次约球、训练和球场日常。</text>

          <view class="profile-tags">
            <text v-for="tag in tags" :key="tag" class="profile-tag">{{ tag }}</text>
          </view>
        </view>
      </view>

      <view class="stats-row">
        <view v-for="item in stats" :key="item.label" class="stat-item">
          <text class="stat-value">{{ item.value }}</text>
          <text class="stat-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="content-panel">
        <view class="content-tabs">
          <view
            class="content-tab"
            :class="{ 'content-tab-active': activeTab === 'posts' }"
            @click="handleTabChange('posts')"
          >
            <text class="content-tab-text">笔记</text>
          </view>
          <view
            class="content-tab"
            :class="{ 'content-tab-active': activeTab === 'saved' }"
            @click="handleTabChange('saved')"
          >
            <text class="content-tab-text">收藏</text>
          </view>
        </view>

        <view class="content-grid">
          <view
            v-for="item in posts"
            :key="`${activeTab}-${item.id}`"
            class="content-card"
            @click="handlePostClick"
          >
            <image class="content-cover" :src="item.cover" mode="aspectFill" />
          </view>
        </view>
      </view>
    </view>

    <AppTabBar current="profile" />
  </scroll-view>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.18), transparent 22%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.profile-shell {
  padding: 96rpx 28rpx 188rpx;
}

.profile-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  color: #fff7f0;
  font-size: 44rpx;
  font-weight: 700;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-top: 34rpx;
}

.profile-avatar {
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 4rpx rgba(255, 247, 240, 0.08);
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.profile-name {
  color: #fff7f0;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.2;
}

.profile-edit {
  color: #c6dc55;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.2;
}

.profile-badge {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(217, 122, 63, 0.16);
}

.profile-badge-text {
  color: #f8c7a7;
  font-size: 20rpx;
  font-weight: 600;
}

.profile-id {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 247, 240, 0.44);
  font-size: 22rpx;
}

.profile-bio {
  display: block;
  margin-top: 18rpx;
  color: rgba(255, 247, 240, 0.78);
  font-size: 26rpx;
  line-height: 1.7;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.profile-tag {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 247, 240, 0.08);
  color: rgba(255, 247, 240, 0.72);
  font-size: 22rpx;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 40rpx;
}

.stat-item {
  padding: 22rpx 18rpx;
  border-radius: 24rpx;
  background: rgba(255, 247, 240, 0.05);
  border: 1rpx solid rgba(255, 247, 240, 0.06);
}

.stat-value {
  display: block;
  color: #fff7f0;
  font-size: 34rpx;
  font-weight: 700;
}

.stat-label {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 247, 240, 0.52);
  font-size: 22rpx;
  line-height: 1.4;
}

.content-panel {
  margin-top: 38rpx;
}

.content-tabs {
  display: flex;
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.content-tab {
  position: relative;
  padding-bottom: 10rpx;
}

.content-tab-text {
  color: rgba(255, 247, 240, 0.5);
  font-size: 28rpx;
  font-weight: 500;
}

.content-tab-active .content-tab-text {
  color: #fff7f0;
  font-weight: 700;
}

.content-tab-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rpx;
  border-radius: 999rpx;
  background: #fff7f0;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.content-card {
  position: relative;
  aspect-ratio: 1 / 1.28;
  border-radius: 20rpx;
  overflow: hidden;
  background: #242323;
}

.content-cover {
  width: 100%;
  height: 100%;
}

@media screen and (min-width: 768px) {
  .profile-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 148px;
  }

  .page-title {
    font-size: 32px;
  }

  .profile-header {
    gap: 20px;
    margin-top: 26px;
  }

  .profile-avatar {
    width: 88px;
    height: 88px;
    box-shadow: 0 0 0 3px rgba(255, 247, 240, 0.08);
  }

  .profile-row {
    gap: 10px;
  }

  .profile-name {
    font-size: 32px;
  }

  .profile-edit {
    font-size: 13px;
  }

  .profile-badge {
    padding: 4px 10px;
  }

  .profile-badge-text {
    font-size: 12px;
  }

  .profile-id {
    margin-top: 8px;
    font-size: 13px;
  }

  .profile-bio {
    margin-top: 14px;
    font-size: 16px;
  }

  .profile-tags {
    gap: 8px;
    margin-top: 14px;
  }

  .profile-tag {
    padding: 6px 12px;
    font-size: 13px;
  }

  .stats-row {
    gap: 12px;
    margin-top: 28px;
  }

  .stat-item {
    padding: 18px 16px;
    border-radius: 20px;
    border-width: 1px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    margin-top: 6px;
    font-size: 13px;
  }

  .content-panel {
    margin-top: 30px;
  }

  .content-tabs {
    gap: 16px;
    margin-bottom: 16px;
  }

  .content-tab {
    padding-bottom: 8px;
  }

  .content-tab-text {
    font-size: 16px;
  }

  .content-tab-active::after {
    height: 3px;
  }

  .content-grid {
    gap: 10px;
  }

  .content-card {
    border-radius: 16px;
  }
}
</style>
