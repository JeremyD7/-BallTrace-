<script setup>
import { computed, ref } from 'vue'
import AppTabBar from '@/components/AppTabBar.vue'

const currentPanel = ref('overview')

const categoryCards = [
  {
    key: 'explore',
    title: '探索消息',
    caption: '点赞、评论和笔记互动',
    count: 3,
    tone: 'orange',
    icon: '/static/images/post.svg'
  },
  {
    key: 'match',
    title: '球局通知',
    caption: '约球申请、通过和活动提醒',
    count: 5,
    tone: 'green',
    icon: '/static/images/basketball.svg'
  },
  {
    key: 'system',
    title: '系统消息',
    caption: '订场、课程和平台通知',
    count: 2,
    tone: 'blue',
    icon: '/static/images/message.svg'
  }
]

const directMessages = [
  {
    id: 1,
    name: '张伟',
    message: '周六下午有空打球吗',
    time: '16分钟前',
    unread: true,
    avatar: '/static/images/art_theman.jpg'
  },
  {
    id: 2,
    name: '李娜',
    message: '下周三的课程可以提前到上午吗',
    time: '2小时前',
    unread: false,
    avatar: '/static/images/art_thewoman.jpg'
  },
  {
    id: 3,
    name: '王强',
    message: '好的，那就这么定了',
    time: '昨天',
    unread: false,
    avatar: '/static/images/theman02.jpg'
  }
]

const panelMessages = {
  explore: [
    {
      id: 1,
      actor: '张伟',
      action: '赞了你的笔记',
      title: '《网球正手技巧分享》',
      time: '10分钟前',
      avatar: '/static/images/art_theman.jpg',
      body: ''
    },
    {
      id: 2,
      actor: '李娜',
      action: '评论了你的笔记',
      title: '《成华区好球场推荐》',
      time: '1小时前',
      avatar: '/static/images/art_thewoman.jpg',
      body: '这家场地晚上灯光不错，下次一起去。'
    },
    {
      id: 3,
      actor: '刘洋',
      action: '赞了你的笔记',
      title: '《双打战术分析》',
      time: '昨天',
      avatar: '/static/images/jeremy.webp',
      body: ''
    },
    {
      id: 4,
      actor: '陈明',
      action: '评论了你的笔记',
      title: '《网球装备选购指南》',
      time: '2天前',
      avatar: '/static/images/art_frommoon.jpg',
      body: '鞋子的抓地感确实很关键。'
    }
  ],
  match: [
    {
      id: 1,
      actor: '李娜',
      action: '申请加入你发起的约球活动',
      title: '周六 16:00 成华体育中心',
      time: '10分钟前',
      status: '待处理'
    },
    {
      id: 2,
      actor: '系统',
      action: '你的申请已通过',
      title: '今晚 19:30 高新网球公园',
      time: '1小时前',
      status: '已通过'
    },
    {
      id: 3,
      actor: '系统',
      action: '距离约球活动开始还有1小时',
      title: '武侯网球公园 3号场',
      time: '2小时前',
      status: '提醒'
    },
    {
      id: 4,
      actor: '系统',
      action: '约球活动已取消',
      title: '青羊体育中心 双打局',
      time: '昨天',
      status: '已取消'
    }
  ],
  system: [
    {
      id: 1,
      actor: '订场成功',
      action: '你已成功预订成华体育中心1号场地',
      title: '今天 20:00-22:00',
      time: '10分钟前',
      status: '成功'
    },
    {
      id: 2,
      actor: '约教练成功',
      action: '你已成功预约教练李明的1v1课程',
      title: '明天 15:00-16:00',
      time: '1小时前',
      status: '课程'
    },
    {
      id: 3,
      actor: '订场成功',
      action: '你已成功预订武侯网球公园3号场地',
      title: '周日 18:00-20:00',
      time: '昨天',
      status: '成功'
    },
    {
      id: 4,
      actor: '订场取消',
      action: '你的订场已取消，费用已退回',
      title: '退款将在1-3个工作日内到账',
      time: '3天前',
      status: '退款'
    }
  ]
}

const panelMeta = {
  explore: {
    title: '探索消息',
    summary: '笔记互动',
    empty: '暂无新的探索消息'
  },
  match: {
    title: '球局通知',
    summary: '活动动态',
    empty: '暂无新的球局通知'
  },
  system: {
    title: '系统消息',
    summary: '平台通知',
    empty: '暂无新的系统消息'
  }
}

const isOverview = computed(() => currentPanel.value === 'overview')
const activeMeta = computed(() => panelMeta[currentPanel.value] || panelMeta.explore)
const activeMessages = computed(() => panelMessages[currentPanel.value] || [])
const unreadDirectCount = computed(() => directMessages.filter((item) => item.unread).length)

function openPanel(key) {
  currentPanel.value = key
}

function handleBack() {
  currentPanel.value = 'overview'
}

function handleMessageTap(item) {
  uni.showToast({
    title: `${item.actor || item.name} 的消息待接入`,
    icon: 'none'
  })
}

function handleDirectTap(item) {
  uni.showToast({
    title: `${item.name} 私信待接入`,
    icon: 'none'
  })
}
</script>

<template>
  <scroll-view class="message-page" scroll-y>
    <view class="message-shell">
      <view v-if="isOverview" class="message-header">
        <text class="message-title">消息</text>
        <text class="message-subtitle">查看互动、球局和系统通知</text>
      </view>

      <view v-else class="panel-topbar">
        <text class="panel-back" @click="handleBack">‹</text>
        <view class="panel-title-wrap">
          <text class="panel-title">{{ activeMeta.title }}</text>
          <text class="panel-summary">{{ activeMeta.summary }}</text>
        </view>
        <view class="panel-spacer" />
      </view>

      <view v-if="isOverview" class="overview-content">
        <view class="category-grid">
          <view
            v-for="category in categoryCards"
            :key="category.key"
            class="category-card"
            :class="`category-card-${category.tone}`"
            @click="openPanel(category.key)"
          >
            <view class="category-head">
              <view class="category-icon">
                <image class="category-icon-image" :src="category.icon" mode="aspectFit" />
              </view>
              <text v-if="category.count > 0" class="category-badge">{{ category.count }}</text>
            </view>
            <text class="category-title">{{ category.title }}</text>
            <text class="category-caption">{{ category.caption }}</text>
          </view>
        </view>

        <view class="section-head">
          <text class="section-title">私信</text>
          <text class="section-note">{{ unreadDirectCount }} 条未读</text>
        </view>

        <view class="direct-list">
          <view
            v-for="item in directMessages"
            :key="item.id"
            class="direct-item"
            @click="handleDirectTap(item)"
          >
            <image class="direct-avatar" :src="item.avatar" mode="aspectFill" />
            <view class="direct-copy">
              <view class="direct-row">
                <text class="direct-name">{{ item.name }}</text>
                <text class="direct-time">{{ item.time }}</text>
              </view>
              <view class="direct-row direct-row-bottom">
                <text class="direct-message">{{ item.message }}</text>
                <view v-if="item.unread" class="direct-dot" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="panel-content">
        <view v-if="activeMessages.length" class="notice-list">
          <view
            v-for="item in activeMessages"
            :key="item.id"
            class="notice-card"
            @click="handleMessageTap(item)"
          >
            <view class="notice-top">
              <view v-if="item.avatar" class="notice-avatar-wrap">
                <image class="notice-avatar" :src="item.avatar" mode="aspectFill" />
              </view>
              <view v-else class="notice-icon">
                <text class="notice-icon-text">{{ item.actor.slice(0, 1) }}</text>
              </view>
              <view class="notice-main">
                <view class="notice-title-row">
                  <text class="notice-actor">{{ item.actor }}</text>
                  <text class="notice-time">{{ item.time }}</text>
                </view>
                <text class="notice-action">{{ item.action }}</text>
              </view>
            </view>
            <view class="notice-detail">
              <text class="notice-detail-title">{{ item.title }}</text>
              <text v-if="item.body" class="notice-detail-body">{{ item.body }}</text>
              <text v-if="item.status" class="notice-status">{{ item.status }}</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-card">
          <text class="empty-title">{{ activeMeta.empty }}</text>
        </view>
      </view>
    </view>

    <AppTabBar v-if="isOverview" current="message" />
  </scroll-view>
</template>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.22), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.message-shell {
  padding: 96rpx 28rpx 180rpx;
}

.message-header {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.message-title {
  color: #fff7f0;
  font-size: 48rpx;
  font-weight: 700;
}

.message-subtitle {
  color: rgba(255, 247, 240, 0.58);
  font-size: 28rpx;
  line-height: 1.5;
}

.overview-content {
  margin-top: 42rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.category-card {
  min-width: 0;
  min-height: 164rpx;
  padding: 22rpx 18rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 28rpx;
  background: linear-gradient(180deg, #242323 0%, #1a1918 100%);
  box-shadow: 0 18rpx 36rpx rgba(0, 0, 0, 0.22);
}

.category-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background: rgba(217, 122, 63, 0.18);
}

.category-card-green .category-icon {
  background: rgba(34, 150, 111, 0.18);
}

.category-card-blue .category-icon {
  background: rgba(92, 137, 210, 0.18);
}

.category-icon-image {
  width: 28rpx;
  height: 28rpx;
}

.category-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34rpx;
  height: 34rpx;
  padding: 0 8rpx;
  border-radius: 999rpx;
  background: $brand-color;
  color: #111111;
  font-size: 20rpx;
  font-weight: 700;
}

.category-title {
  display: block;
  margin-top: 22rpx;
  color: #f4f4f4;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.35;
}

.category-caption {
  display: block;
  margin-top: 8rpx;
  color: rgba(244, 244, 244, 0.48);
  font-size: 21rpx;
  line-height: 1.45;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 54rpx;
  margin-bottom: 22rpx;
}

.section-title {
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.section-note {
  color: rgba(244, 244, 244, 0.42);
  font-size: 24rpx;
}

.direct-list,
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.direct-item {
  display: grid;
  grid-template-columns: 72rpx minmax(0, 1fr);
  gap: 20rpx;
  align-items: center;
  min-height: 104rpx;
  padding: 18rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.07);
  border-radius: 26rpx;
  background: rgba(36, 35, 35, 0.92);
}

.direct-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #434343;
}

.direct-copy {
  min-width: 0;
}

.direct-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.direct-row-bottom {
  margin-top: 8rpx;
}

.direct-name {
  min-width: 0;
  color: #f4f4f4;
  font-size: 28rpx;
  font-weight: 600;
}

.direct-time {
  flex-shrink: 0;
  color: rgba(244, 244, 244, 0.42);
  font-size: 22rpx;
}

.direct-message {
  min-width: 0;
  overflow: hidden;
  color: rgba(244, 244, 244, 0.56);
  font-size: 25rpx;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.direct-dot {
  flex-shrink: 0;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $brand-color;
  box-shadow: 0 0 18rpx rgba(217, 122, 63, 0.62);
}

.panel-topbar {
  display: grid;
  grid-template-columns: 56rpx 1fr 56rpx;
  align-items: center;
}

.panel-back {
  color: #f4f4f4;
  font-size: 64rpx;
  line-height: 1;
}

.panel-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  min-width: 0;
}

.panel-title {
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.panel-summary {
  color: rgba(244, 244, 244, 0.45);
  font-size: 22rpx;
}

.panel-spacer {
  width: 56rpx;
  height: 56rpx;
}

.panel-content {
  margin-top: 40rpx;
}

.notice-card {
  padding: 26rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.07);
  border-radius: 28rpx;
  background: linear-gradient(180deg, #242323 0%, #1b1a19 100%);
  box-shadow: 0 18rpx 36rpx rgba(0, 0, 0, 0.18);
}

.notice-top {
  display: grid;
  grid-template-columns: 76rpx minmax(0, 1fr);
  gap: 18rpx;
  align-items: center;
}

.notice-avatar-wrap,
.notice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(217, 122, 63, 0.18);
}

.notice-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
}

.notice-icon-text {
  color: $brand-color;
  font-size: 30rpx;
  font-weight: 700;
}

.notice-main {
  min-width: 0;
}

.notice-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.notice-actor {
  min-width: 0;
  color: #f4f4f4;
  font-size: 28rpx;
  font-weight: 600;
}

.notice-time {
  flex-shrink: 0;
  color: rgba(244, 244, 244, 0.42);
  font-size: 22rpx;
}

.notice-action {
  display: block;
  margin-top: 8rpx;
  color: rgba(244, 244, 244, 0.58);
  font-size: 25rpx;
  line-height: 1.4;
}

.notice-detail {
  position: relative;
  margin-top: 22rpx;
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: rgba(255, 247, 240, 0.055);
}

.notice-detail-title {
  display: block;
  color: #fff7f0;
  font-size: 27rpx;
  font-weight: 600;
  line-height: 1.45;
}

.notice-detail-body {
  display: block;
  margin-top: 8rpx;
  color: rgba(244, 244, 244, 0.52);
  font-size: 24rpx;
  line-height: 1.5;
}

.notice-status {
  display: inline-flex;
  margin-top: 14rpx;
  padding: 7rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(217, 122, 63, 0.18);
  color: $brand-color;
  font-size: 22rpx;
  font-weight: 600;
}

.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.07);
  border-radius: 28rpx;
  background: rgba(36, 35, 35, 0.88);
}

.empty-title {
  color: rgba(244, 244, 244, 0.5);
  font-size: 28rpx;
}

@media screen and (min-width: 768px) {
  .message-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 140px;
  }

  .message-header {
    gap: 8px;
  }

  .message-title {
    font-size: 38px;
  }

  .message-subtitle {
    font-size: 16px;
  }

  .overview-content {
    margin-top: 28px;
  }

  .category-grid {
    gap: 14px;
  }

  .category-card {
    min-height: 142px;
    padding: 18px;
    border-radius: 24px;
    border-width: 1px;
  }

  .category-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .category-icon-image {
    width: 22px;
    height: 22px;
  }

  .category-badge {
    min-width: 24px;
    height: 24px;
    padding: 0 7px;
    font-size: 12px;
  }

  .category-title {
    margin-top: 16px;
    font-size: 18px;
  }

  .category-caption {
    margin-top: 6px;
    font-size: 13px;
  }

  .section-head {
    margin-top: 36px;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .section-note {
    font-size: 14px;
  }

  .direct-list,
  .notice-list {
    gap: 14px;
  }

  .direct-item {
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 14px;
    min-height: 80px;
    padding: 14px;
    border-radius: 22px;
    border-width: 1px;
  }

  .direct-avatar {
    width: 52px;
    height: 52px;
  }

  .direct-row {
    gap: 12px;
  }

  .direct-name {
    font-size: 17px;
  }

  .direct-time,
  .direct-message {
    font-size: 13px;
  }

  .direct-dot {
    width: 8px;
    height: 8px;
  }

  .panel-topbar {
    grid-template-columns: 36px 1fr 36px;
  }

  .panel-back {
    font-size: 42px;
  }

  .panel-title {
    font-size: 24px;
  }

  .panel-summary {
    font-size: 13px;
  }

  .panel-content {
    margin-top: 28px;
  }

  .notice-card {
    padding: 20px;
    border-radius: 24px;
    border-width: 1px;
  }

  .notice-top {
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 14px;
  }

  .notice-avatar-wrap,
  .notice-icon,
  .notice-avatar {
    width: 54px;
    height: 54px;
  }

  .notice-icon-text {
    font-size: 20px;
  }

  .notice-actor {
    font-size: 17px;
  }

  .notice-time {
    font-size: 13px;
  }

  .notice-action {
    margin-top: 6px;
    font-size: 14px;
  }

  .notice-detail {
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 16px;
  }

  .notice-detail-title {
    font-size: 16px;
  }

  .notice-detail-body {
    margin-top: 6px;
    font-size: 14px;
  }

  .notice-status {
    margin-top: 10px;
    padding: 5px 10px;
    font-size: 12px;
  }
}
</style>
