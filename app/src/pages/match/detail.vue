<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMatchById } from '@/pages/data/matches'

const matchId = ref(1)

onLoad((options) => {
  matchId.value = Number(options?.id || 1)
})

const match = computed(() => getMatchById(matchId.value) || getMatchById(1))
const missingCount = computed(() => Math.max((match.value?.total || 0) - (match.value?.joined || 0), 0))

const conditions = computed(() => [
  { label: '活动类型', value: match.value.type },
  { label: '水平要求', value: match.value.level },
  { label: '费用参考', value: match.value.price }
])

function handleBack() {
  uni.navigateBack({
    fail() {
      uni.reLaunch({
        url: '/pages/match/index'
      })
    }
  })
}

function handleApply() {
  uni.showToast({
    title: '申请加入待接入',
    icon: 'none'
  })
}
</script>

<template>
  <scroll-view class="detail-page" scroll-y>
    <view class="detail-shell" v-if="match">
      <view class="detail-topbar">
        <text class="detail-back" @click="handleBack">‹</text>
        <text class="detail-title">活动详情</text>
        <text class="detail-share">↗</text>
      </view>

      <view class="detail-card">
        <view class="detail-card-head">
          <text class="detail-main-title">{{ match.title }}</text>
          <text class="detail-missing">(缺{{ missingCount }}人)</text>
        </view>

        <view class="detail-line">
          <text class="detail-line-label">约球宣言</text>
          <text class="detail-line-text">{{ match.slogan }}</text>
        </view>

        <view class="detail-tags">
          <text v-for="tag in match.tags" :key="tag" class="detail-tag">{{ tag }}</text>
        </view>

        <view class="detail-info-grid">
          <view class="detail-info-item">
            <text class="detail-info-label">时间</text>
            <text class="detail-info-value">{{ match.schedule }}</text>
          </view>
          <view class="detail-info-item">
            <text class="detail-info-label">费用</text>
            <text class="detail-info-value">{{ match.feeRule }}</text>
          </view>
          <view class="detail-info-item">
            <text class="detail-info-label">地点</text>
            <text class="detail-info-value">{{ match.location }}</text>
          </view>
          <view class="detail-info-item">
            <text class="detail-info-label">价格</text>
            <text class="detail-info-value">{{ match.price }}</text>
          </view>
        </view>
      </view>

      <view class="detail-section">
        <text class="section-title">参与成员</text>
        <view class="member-grid">
          <view v-for="member in match.participants" :key="member.id" class="member-card">
            <image class="member-avatar" :src="member.avatar" mode="aspectFill" />
            <text class="member-name">{{ member.name }}</text>
            <text class="member-score">{{ member.score }}</text>
            <text v-if="member.role" class="member-role">{{ member.role }}</text>
          </view>
        </view>
      </view>

      <view class="detail-section">
        <text class="section-title">参与条件一览</text>
        <view class="condition-list">
          <view v-for="item in conditions" :key="item.label" class="condition-item">
            <text class="condition-label">{{ item.label }}</text>
            <text class="condition-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <view class="detail-section">
        <text class="section-title">备注</text>
        <view class="remark-card">
          <text class="remark-text">{{ match.slogan }}</text>
        </view>
      </view>

      <view class="warm-card">
        <text class="warm-text">{{ match.note }}</text>
      </view>

      <button class="apply-button" hover-class="apply-button-hover" @click="handleApply">
        申请加入
      </button>
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.18), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 44%, #151311 100%);
}

.detail-shell {
  padding: 96rpx 28rpx 72rpx;
}

.detail-topbar {
  display: grid;
  grid-template-columns: 48rpx 1fr 48rpx;
  align-items: center;
}

.detail-back,
.detail-share {
  color: #f4f4f4;
  font-size: 56rpx;
  line-height: 1;
}

.detail-share {
  text-align: right;
  font-size: 30rpx;
}

.detail-title {
  text-align: center;
  color: #f4f4f4;
  font-size: 34rpx;
  font-weight: 600;
}

.detail-card,
.detail-section,
.warm-card {
  margin-top: 22rpx;
  padding: 28rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, rgba(41, 39, 38, 0.98) 0%, rgba(30, 28, 27, 0.98) 100%);
  border: 1rpx solid rgba(255, 247, 240, 0.08);
}

.detail-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-main-title {
  color: #fff7f0;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.4;
}

.detail-missing {
  color: $brand-color;
  font-size: 26rpx;
  flex-shrink: 0;
}

.detail-line {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 20rpx;
}

.detail-line-label,
.section-title {
  color: #eeeeee;
  font-size: 30rpx;
  font-weight: 600;
}

.detail-line-text,
.remark-text,
.warm-text {
  color: rgba(244, 244, 244, 0.64);
  font-size: 24rpx;
  line-height: 1.7;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.detail-tag {
  padding: 8rpx 14rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.16);
  border-radius: 999rpx;
  color: rgba(255, 247, 240, 0.8);
  font-size: 22rpx;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 24rpx;
}

.detail-info-item {
  padding: 18rpx;
  border-radius: 22rpx;
  background: rgba(255, 247, 240, 0.04);
}

.detail-info-label,
.condition-label {
  color: rgba(244, 244, 244, 0.44);
  font-size: 22rpx;
}

.detail-info-value,
.condition-value {
  display: block;
  margin-top: 8rpx;
  color: #eeeeee;
  font-size: 24rpx;
  line-height: 1.6;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 20rpx;
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.member-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}

.member-name {
  margin-top: 12rpx;
  color: #eeeeee;
  font-size: 24rpx;
}

.member-score {
  margin-top: 6rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 247, 240, 0.08);
  color: rgba(244, 244, 244, 0.72);
  font-size: 20rpx;
}

.member-role {
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(217, 122, 63, 0.18);
  color: $brand-color;
  font-size: 18rpx;
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 18rpx;
}

.condition-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(255, 247, 240, 0.08);
}

.condition-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.warm-card {
  background: rgba(238, 130, 53, 0.15);
  border-color: rgba(238, 130, 53, 0.2);
}

.warm-text {
  color: #ee8235;
  font-size: 20rpx;
}

.apply-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100rpx;
  margin-top: 28rpx;
  border: 0;
  border-radius: 24rpx;
  background: $brand-color;
  color: #111111;
  font-size: 32rpx;
  font-weight: 700;
}

.apply-button::after {
  border: 0;
}

.apply-button-hover {
  opacity: 0.88;
}

@media screen and (min-width: 768px) {
  .detail-shell {
    max-width: 960px;
    margin: 0 auto;
    padding: 72px 24px 64px;
  }

  .detail-topbar {
    grid-template-columns: 28px 1fr 28px;
  }

  .detail-back {
    font-size: 38px;
  }

  .detail-share {
    font-size: 20px;
  }

  .detail-title {
    font-size: 24px;
  }

  .detail-card,
  .detail-section,
  .warm-card {
    margin-top: 16px;
    padding: 24px;
    border-radius: 24px;
    border-width: 1px;
  }

  .detail-main-title {
    font-size: 26px;
  }

  .detail-missing {
    font-size: 18px;
  }

  .detail-line-label,
  .section-title {
    font-size: 20px;
  }

  .detail-line-text,
  .remark-text {
    font-size: 14px;
  }

  .detail-tags {
    gap: 8px;
    margin-top: 16px;
  }

  .detail-tag {
    padding: 6px 10px;
    font-size: 13px;
  }

  .detail-info-grid {
    gap: 12px;
    margin-top: 18px;
  }

  .detail-info-item {
    padding: 14px;
    border-radius: 16px;
  }

  .detail-info-label,
  .condition-label {
    font-size: 13px;
  }

  .detail-info-value,
  .condition-value {
    font-size: 14px;
  }

  .member-grid {
    gap: 14px;
    margin-top: 16px;
  }

  .member-avatar {
    width: 56px;
    height: 56px;
  }

  .member-name {
    margin-top: 8px;
    font-size: 14px;
  }

  .member-score {
    margin-top: 4px;
    padding: 3px 8px;
    font-size: 12px;
  }

  .member-role {
    margin-top: 6px;
    padding: 3px 8px;
    font-size: 11px;
  }

  .condition-list {
    gap: 12px;
    margin-top: 14px;
  }

  .condition-item {
    padding-bottom: 12px;
    border-bottom-width: 1px;
  }

  .warm-text {
    font-size: 12px;
  }

  .apply-button {
    height: 62px;
    margin-top: 22px;
    border-radius: 18px;
    font-size: 18px;
  }
}
</style>
