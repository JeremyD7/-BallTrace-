<script setup>
import { computed } from 'vue'
import AppTabBar from '@/components/AppTabBar.vue'
import PostWaterfallCard from '@/components/PostWaterfallCard.vue'

const quickActions = [
  {
    key: 'match',
    title: '约球',
    caption: '快速发起一场球局',
    icon: '/static/images/basketball.svg'
  },
  {
    key: 'post',
    title: '发帖',
    caption: '分享战报与球场日常',
    icon: '/static/images/post.svg'
  }
]

const posts = [
  {
    id: 1,
    title: '今晚天府体院馆约球',
    content: '今晚想在天府体院馆打野，想找两位稳定搭子一起冲，节奏友好，欢迎下班后直接来。',
    author: '球场拾光',
    likes: 256,
    cover: '/static/images/art_theman.jpg'
  },
  {
    id: 2,
    title: '新手热身动作清单',
    content: '第一次参加周末球局，整理了一份适合开打前做的热身动作清单，想分享给刚入门的朋友。',
    author: '张三',
    likes: 189,
    cover: '/static/images/art_thewoman.jpg'
  },
  {
    id: 3,
    title: '市区夜场球场推荐',
    content: '市区夜场灯光意外不错，这片球场拍照真的很出片，地面反馈也很稳，适合晚上约球。',
    author: 'Ace慢热',
    likes: 321,
    cover: '/static/images/art_frommoon.jpg'
  },
  {
    id: 4,
    title: '发球训练后的恢复安排',
    content: '练完发球后做了一组力量恢复，把我最近在用的训练和放松节奏整理出来，给大家参考。',
    author: '后场观察员',
    likes: 145,
    cover: '/static/images/theman02.jpg'
  },
  {
    id: 5,
    title: '球鞋抓地力实测',
    content: '测试了同一双球鞋在湿地和硬地两种场景里的表现，抓地差别比想象里更大，分享一下感受。',
    author: '落点实验室',
    likes: 274,
    cover: '/static/images/earth.jpg'
  },
  {
    id: 6,
    title: '发帖卡片结构示意',
    content: '这是一个发帖占位卡片示意，后面接接口后可以直接替换成真实内容流和详情内容。',
    author: 'BallTrace',
    likes: 98,
    cover: '/static/images/art_frommoon.jpg'
  }
]

const leftPosts = computed(() => posts.filter((_, index) => index % 2 === 0))
const rightPosts = computed(() => posts.filter((_, index) => index % 2 === 1))

function handleActionClick(action) {
  if (action.key === 'match') {
    uni.navigateTo({
      url: '/pages/match/index'
    })
    return
  }

  uni.showToast({
    title: `${action.title}功能待接入`,
    icon: 'none'
  })
}

function handlePostClick(post) {
  uni.showToast({
    title: `打开帖子：${post.author}`,
    icon: 'none'
  })
}
</script>

<template>
  <scroll-view class="page" scroll-y>
    <view class="page-shell">
      <view class="brand-row">
        <image class="brand-logo" src="@/static/images/logo.png" mode="aspectFit" />
        <text class="brand-subtitle">你的篮球生活平台</text>
      </view>

      <view class="action-grid">
        <view v-for="action in quickActions" :key="action.key" class="action-card" @click="handleActionClick(action)">
          <view class="action-icon">
            <image class="action-icon-image" :src="action.icon" mode="aspectFit" />
          </view>
          <text class="action-title">{{ action.title }}</text>
          <text class="action-caption">{{ action.caption }}</text>
        </view>
      </view>

      <view class="section-head">
        <text class="section-title">最新帖子</text>
        <text class="section-note">瀑布流静态示意</text>
      </view>

      <view class="waterfall-grid">
        <view class="waterfall-column">
          <PostWaterfallCard v-for="post in leftPosts" :key="post.id" :post="post" @click="handlePostClick(post)" />
        </view>

        <view class="waterfall-column">
          <PostWaterfallCard v-for="post in rightPosts" :key="post.id" :post="post" @click="handlePostClick(post)" />
        </view>
      </view>
    </view>

    <AppTabBar current="home" />
  </scroll-view>
</template>

<style lang="scss" scoped>

.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.22), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.page-shell {
  padding: 96rpx 28rpx 180rpx;
}

.brand-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16rpx;
}

.brand-logo {
  width: 140rpx;
  height: 66rpx;
}

.brand-subtitle {
  color: rgba(255, 247, 240, 0.54);
  font-size: 32rpx;
  line-height: 1.5;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin-top: 42rpx;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190rpx;
  padding: 28rpx 18rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #242323 0%, #1a1918 100%);
  box-shadow: 0 18rpx 36rpx rgba(0, 0, 0, 0.22);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 247, 240, 0.08);
}

.action-icon-image {
  width: 38rpx;
  height: 38rpx;
}

.action-title {
  margin-top: 18rpx;
  color: #f4f4f4;
  font-size: 32rpx;
  font-weight: 600;
}

.action-caption {
  margin-top: 10rpx;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(244, 244, 244, 0.5);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 54rpx;
  margin-bottom: 24rpx;
}

.section-title {
  color: #d9d9d9;
  font-size: 34rpx;
  font-weight: 600;
}

.section-note {
  color: rgba(244, 244, 244, 0.42);
  font-size: 22rpx;
}

.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  align-items: start;
}

.waterfall-column {
  min-width: 0;
}

@media screen and (min-width: 768px) {
  .page-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 140px;
  }

  .brand-row {
    gap: 10px;
  }

  .brand-logo {
    width: 96px;
    height: 45px;
  }

  .brand-subtitle {
    font-size: 18px;
  }

  .action-grid {
    gap: 16px;
    margin-top: 28px;
  }

  .action-card {
    min-height: 160px;
    padding: 24px 18px;
    border-radius: 24px;
  }

  .action-icon {
    width: 52px;
    height: 52px;
  }

  .action-icon-image {
    width: 24px;
    height: 24px;
  }

  .action-title {
    margin-top: 12px;
    font-size: 22px;
  }

  .action-caption {
    margin-top: 8px;
    font-size: 14px;
  }

  .section-head {
    margin-top: 36px;
    margin-bottom: 18px;
  }

  .section-title {
    font-size: 24px;
  }

  .section-note {
    font-size: 13px;
  }

  .waterfall-grid {
    gap: 16px;
  }
}
</style>
