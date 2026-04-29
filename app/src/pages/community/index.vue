<script setup>
import { computed, ref } from 'vue'
import AppTabBar from '@/components/AppTabBar.vue'
import PostWaterfallCard from '@/components/PostWaterfallCard.vue'

const activeTab = ref('recommend')
const searchKeyword = ref('')

const tabs = [
  {
    key: 'recommend',
    label: '推荐'
  },
  {
    key: 'latest',
    label: '最新'
  },
  {
    key: 'hot',
    label: '最热'
  }
]

const defaultPosts = [
  {
    id: 1,
    title: '成都最美球场推荐',
    content: '傍晚的灯光和场地线条很适合拍照，硬地回弹也稳，适合约一场轻松双打。',
    author: '网球爱好者',
    avatar: '/static/images/jeremy.webp',
    cover: '/static/images/art_frommoon.jpg',
    likes: 326,
    comments: 42,
    tags: ['球场', '成都'],
    category: 'recommend',
    publishedAt: '10分钟前'
  },
  {
    id: 2,
    title: '今天打球心得分享',
    content: '正手发力终于找到一点感觉，重点是提前转肩和击球后完整随挥。',
    author: '张三',
    avatar: '/static/images/theman02.jpg',
    cover: '/static/images/art_theman.jpg',
    likes: 218,
    comments: 31,
    tags: ['训练', '心得'],
    category: 'latest',
    publishedAt: '32分钟前'
  },
  {
    id: 3,
    title: '新手第一次双打要注意什么',
    content: '少抢球、多沟通、站位别太靠后，先把回合打起来比追求制胜分更重要。',
    author: 'Ace慢热',
    avatar: '/static/images/art_thewoman.jpg',
    cover: '/static/images/earth.jpg',
    likes: 451,
    comments: 68,
    tags: ['双打', '新手'],
    category: 'hot',
    publishedAt: '1小时前'
  },
  {
    id: 4,
    title: '下班后约球路线',
    content: '从地铁口步行八分钟到场，附近有便利店和停车位，适合工作日晚上拼场。',
    author: '球场拾光',
    avatar: '/static/images/art_frommoon.jpg',
    cover: '/static/images/art_thewoman.jpg',
    likes: 188,
    comments: 24,
    tags: ['约球', '路线'],
    category: 'recommend',
    publishedAt: '2小时前'
  },
  {
    id: 5,
    title: '一组实用热身动作',
    content: '开打前先做肩部环绕、髋部激活和小碎步，身体打开后失误率会低很多。',
    author: '后场观察员',
    avatar: '/static/images/jeremy.webp',
    cover: '/static/images/theman02.jpg',
    likes: 274,
    comments: 36,
    tags: ['热身', '训练'],
    category: 'latest',
    publishedAt: '今天'
  },
  {
    id: 6,
    title: '球鞋抓地力实测',
    content: '同一双鞋在潮湿硬地和干燥硬地上差别明显，起停动作一定要留安全余量。',
    author: '落点实验室',
    avatar: '/static/images/art_theman.jpg',
    cover: '/static/images/art_frommoon.jpg',
    likes: 389,
    comments: 57,
    tags: ['装备', '测评'],
    category: 'hot',
    publishedAt: '昨天'
  }
]

const visiblePosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return defaultPosts
    .filter((post) => {
      if (activeTab.value === 'recommend') {
        return true
      }

      return post.category === activeTab.value
    })
    .filter((post) => {
      if (!keyword) {
        return true
      }

      return [post.title, post.content, post.author, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
    .sort((a, b) => {
      if (activeTab.value === 'hot') {
        return b.likes - a.likes
      }

      return a.id - b.id
    })
})

const leftPosts = computed(() => visiblePosts.value.filter((_, index) => index % 2 === 0))
const rightPosts = computed(() => visiblePosts.value.filter((_, index) => index % 2 === 1))

function setActiveTab(key) {
  activeTab.value = key
}

function handleCreatePost() {
  uni.navigateTo({
    url: '/pages/community/create'
  })
}

function handlePostClick(post) {
  uni.navigateTo({
    url: `/pages/community/detail?id=${post.id}`
  })
}
</script>

<template>
  <view class="community-page">
  <scroll-view class="community-scroll" scroll-y>
    <view class="community-shell">
      <view class="topbar">
        <view class="topbar-spacer" />
        <text class="topbar-title">社区</text>
        <view class="publish-action" @click="handleCreatePost">
          <text class="publish-text">发布</text>
          <text class="publish-plus">+</text>
        </view>
      </view>

      <view class="search-box">
        <text class="search-icon">⌕</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          confirm-type="search"
          placeholder="搜索帖子"
          placeholder-class="search-placeholder"
        />
      </view>

      <view class="tab-row">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ 'tab-item-active': activeTab === tab.key }"
          @click="setActiveTab(tab.key)"
        >
          <text class="tab-label">{{ tab.label }}</text>
        </view>
      </view>

      <view v-if="visiblePosts.length" class="waterfall-grid">
        <view class="waterfall-column">
          <PostWaterfallCard
            v-for="post in leftPosts"
            :key="post.id"
            :post="post"
            @click="handlePostClick(post)"
          />
        </view>

        <view class="waterfall-column">
          <PostWaterfallCard
            v-for="post in rightPosts"
            :key="post.id"
            :post="post"
            @click="handlePostClick(post)"
          />
        </view>
      </view>

      <view v-else class="empty-card">
        <text class="empty-title">没有找到相关帖子</text>
        <text class="empty-copy">换个关键词试试看</text>
      </view>
    </view>

    <AppTabBar current="community" />
  </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.community-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.22), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.community-scroll {
  min-height: 100vh;
}

.community-shell {
  padding: 96rpx 28rpx 180rpx;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-spacer,
.publish-action {
  width: 108rpx;
}

.topbar-title {
  flex: 1;
  text-align: center;
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.publish-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.publish-text {
  color: $brand-color;
  font-size: 28rpx;
  font-weight: 600;
}

.publish-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(217, 122, 63, 0.18);
  color: $brand-color;
  font-size: 28rpx;
  font-weight: 700;
}

.search-box {
  display: flex;
  align-items: center;
  height: 88rpx;
  margin-top: 38rpx;
  padding: 0 28rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 999rpx;
  background: #242323;
}

.search-icon {
  color: rgba(244, 244, 244, 0.48);
  font-size: 34rpx;
  line-height: 1;
}

.search-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  margin-left: 10rpx;
  color: #f4f4f4;
  font-size: 28rpx;
}

.search-placeholder {
  color: rgba(244, 244, 244, 0.42);
}

.tab-row {
  display: flex;
  align-items: center;
  gap: 42rpx;
  margin-top: 36rpx;
}

.tab-item {
  position: relative;
  padding-bottom: 14rpx;
}

.tab-label {
  color: rgba(244, 244, 244, 0.5);
  font-size: 30rpx;
  font-weight: 500;
}

.tab-item-active .tab-label {
  color: $brand-color;
}

.tab-item-active::after {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 28rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: $brand-color;
  content: '';
  transform: translateX(-50%);
}

.waterfall-grid {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 18rpx;
}

.waterfall-column {
  width: calc(50% - 8rpx);
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
  margin-top: 36rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 28rpx;
  background: rgba(36, 35, 35, 0.9);
}

.empty-title {
  color: #f4f4f4;
  font-size: 30rpx;
  font-weight: 600;
}

.empty-copy {
  margin-top: 10rpx;
  color: rgba(244, 244, 244, 0.5);
  font-size: 24rpx;
}

@media screen and (min-width: 768px) {
  .community-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 140px;
  }

  .topbar {
    display: flex;
  }

  .topbar-spacer,
  .publish-action {
    width: 80px;
  }

  .topbar-title {
    font-size: 24px;
  }

  .publish-text {
    font-size: 16px;
  }

  .publish-plus {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }

  .search-box {
    height: 52px;
    margin-top: 28px;
    padding: 0 18px;
    border-width: 1px;
  }

  .search-icon {
    font-size: 22px;
  }

  .search-input {
    margin-left: 8px;
    font-size: 16px;
  }

  .tab-row {
    gap: 28px;
    margin-top: 24px;
  }

  .tab-item {
    padding-bottom: 10px;
  }

  .tab-label {
    font-size: 18px;
  }

  .tab-item-active::after {
    width: 20px;
    height: 4px;
  }

  .waterfall-grid {
    margin-top: 16px;
  }

  .waterfall-column {
    width: calc(50% - 8px);
  }

  .empty-card {
    min-height: 240px;
    margin-top: 28px;
    border-radius: 24px;
    border-width: 1px;
  }

  .empty-title {
    font-size: 18px;
  }

  .empty-copy {
    margin-top: 8px;
    font-size: 14px;
  }
}
</style>
