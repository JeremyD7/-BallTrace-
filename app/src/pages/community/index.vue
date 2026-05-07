<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppTabBar from '@/components/AppTabBar.vue'
import PostWaterfallCard from '@/components/PostWaterfallCard.vue'
import { getCommunityFeed } from '@/api/community'

const activeTab = ref('recommend')
const searchKeyword = ref('')
const posts = ref([])
const hasLoaded = ref(false)
const loading = ref(false)
let searchTimer

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

const visiblePosts = computed(() => {
  return posts.value
})

const leftPosts = computed(() => visiblePosts.value.filter((_, index) => index % 2 === 0))
const rightPosts = computed(() => visiblePosts.value.filter((_, index) => index % 2 === 1))

onMounted(loadPosts)

watch(searchKeyword, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadPosts, 300)
})

async function loadPosts() {
  loading.value = true

  try {
    const data = await getCommunityFeed({
      tab: activeTab.value,
      keyword: searchKeyword.value.trim(),
      pageSize: 20
    })
    posts.value = data?.items || []
  } catch (error) {
    uni.showToast({
      title: error?.message || '帖子流加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    hasLoaded.value = true
  }
}

function setActiveTab(key) {
  activeTab.value = key
  loadPosts()
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
        <text class="empty-title">{{ loading && !hasLoaded ? '帖子加载中' : '没有找到相关帖子' }}</text>
        <text class="empty-copy">{{ loading && !hasLoaded ? '正在获取最新内容...' : '换个关键词试试看' }}</text>
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
