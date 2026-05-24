<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { onHide, onLoad, onShow } from '@dcloudio/uni-app'
import {
  approveMatchApplication,
  getMatchPostDetail,
  applyMatchPost,
  rejectMatchApplication
} from '@/api/matches'
import { subscribeNotifications } from '@/api/messages'

const matchId = ref(1)
const matchData = ref(null)
const loading = ref(true)
const applying = ref(false)
const reviewingApplicantId = ref(null)
let matchStream = null

onLoad((options) => {
  matchId.value = Number(options?.id || 1)
  loadMatchDetail()
})
onShow(connectMatchStream)
onHide(closeMatchStream)
onUnmounted(closeMatchStream)

async function loadMatchDetail() {
  loading.value = true

  try {
    const data = await getMatchPostDetail(matchId.value)
    setMatchData(data)
  } catch (error) {
    uni.showToast({
      title: error?.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const match = computed(() => matchData.value)
const missingCount = computed(() => Math.max((match.value?.total || 0) - (match.value?.joined || 0), 0))
const participants = computed(() => {
  if (!Array.isArray(match.value?.participants)) {
    return []
  }

  return match.value.participants
})
const visibleParticipants = computed(() => participants.value.filter((member) => member.status !== 'rejected'))

const conditions = computed(() => [
  { label: '活动类型', value: match.value?.type || '--' },
  { label: '水平要求', value: match.value?.level || '--' },
  { label: '费用参考', value: match.value?.price || '--' }
])

const currentUserId = computed(() => {
  const storedUser = uni.getStorageSync('balltrace_user') || uni.getStorageSync('userInfo')
  return storedUser?.id || null
})

const isOrganizer = computed(() => {
  if (!participants.value.length || !currentUserId.value) {
    return false
  }

  return participants.value.some((participant) => (
    Number(participant.id) === Number(currentUserId.value) &&
      participant.role === '组织者'
  ))
})

const hasApplied = computed(() => {
  if (!participants.value.length || !currentUserId.value) return false
  return participants.value.some(p => Number(p.id) === Number(currentUserId.value))
})

const applyStatus = computed(() => {
  if (!participants.value.length || !currentUserId.value) return null
  const participant = participants.value.find(p => Number(p.id) === Number(currentUserId.value))
  return participant?.status || null
})

const canApply = computed(() => !applying.value && (!hasApplied.value || applyStatus.value === 'rejected'))

function canReviewMember(member) {
  return Boolean(
    isOrganizer.value &&
      member?.status === 'pending' &&
      Number(member.id) !== Number(currentUserId.value)
  )
}

function isMatchSnapshot(payload) {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      payload.id != null &&
      (Array.isArray(payload.participants) ||
        Object.prototype.hasOwnProperty.call(payload, 'joined') ||
        Object.prototype.hasOwnProperty.call(payload, 'total') ||
        Object.prototype.hasOwnProperty.call(payload, 'schedule'))
  )
}

function extractMatchSnapshot(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (isMatchSnapshot(payload)) {
    return payload
  }

  const wrappedMatch = payload.match
  if (wrappedMatch && typeof wrappedMatch === 'object' && isMatchSnapshot(wrappedMatch)) {
    return wrappedMatch
  }

  const wrappedData = payload.data
  if (wrappedData && typeof wrappedData === 'object') {
    const nestedData = extractMatchSnapshot(wrappedData)
    if (nestedData) {
      return nestedData
    }
  }

  const wrappedPayload = payload.payload
  if (wrappedPayload && typeof wrappedPayload === 'object') {
    const nestedPayload = extractMatchSnapshot(wrappedPayload)
    if (nestedPayload) {
      return nestedPayload
    }
  }

  return null
}

function setMatchData(nextMatch) {
  if (!nextMatch || typeof nextMatch !== 'object') {
    return
  }

  matchData.value = {
    ...(matchData.value || {}),
    ...nextMatch,
    id: Number(nextMatch.id || matchId.value)
  }
}

function handleMatchStreamMessage(message) {
  const snapshot = extractMatchSnapshot(message)

  if (!snapshot || Number(snapshot.id) !== Number(matchId.value)) {
    return
  }

  setMatchData(snapshot)
}

function connectMatchStream() {
  // #ifdef H5
  if (matchStream) {
    return
  }

  try {
    matchStream = subscribeNotifications(handleMatchStreamMessage)
  } catch (error) {
    console.warn('约球推送连接失败', error)
  }
  // #endif
}

function closeMatchStream() {
  if (matchStream) {
    matchStream.close()
    matchStream = null
  }
}

function handleBack() {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // #ifdef H5
    window.location.href = '/#/pages/match/index'
    // #endif
    // #ifndef H5
    uni.switchTab({
      url: '/pages/match/index'
    })
    // #endif
  }
}

async function handleApply() {
  if (!canApply.value) {
    return
  }

  applying.value = true

  try {
    const result = await applyMatchPost(matchId.value)
    uni.showToast({
      title: result.message || '申请成功，等待审核',
      icon: 'success'
    })
    await loadMatchDetail()
  } catch (error) {
    uni.showToast({
      title: error?.message || '申请失败',
      icon: 'none'
    })
  } finally {
    applying.value = false
  }
}

async function handleReview(member, action) {
  if (!canReviewMember(member) || reviewingApplicantId.value) {
    return
  }

  reviewingApplicantId.value = member.id

  try {
    const result = action === 'approve'
      ? await approveMatchApplication(matchId.value, member.id)
      : await rejectMatchApplication(matchId.value, member.id)

    uni.showToast({
      title: result?.message || (action === 'approve' ? '已通过申请' : '已拒绝申请'),
      icon: 'success'
    })
    await loadMatchDetail()
  } catch (error) {
    uni.showToast({
      title: error?.message || '处理失败',
      icon: 'none'
    })
  } finally {
    reviewingApplicantId.value = null
  }
}
</script>

<template>
  <scroll-view class="detail-page" scroll-y>
    <view v-if="loading" class="loading-wrap">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="match" class="detail-shell">
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
          <view v-for="member in visibleParticipants" :key="member.id" class="member-card">
            <image class="member-avatar" :src="member.avatar || '/static/images/jeremy.webp'" mode="aspectFill" />
            <text class="member-name">{{ member.name }}</text>
            <text class="member-score">{{ member.score }}</text>
            <text v-if="member.role" class="member-role">{{ member.role }}</text>
            <text v-else-if="member.status === 'pending'" class="member-status">审核中</text>
            <view v-if="canReviewMember(member)" class="member-review-actions">
              <button
                class="member-review-button member-review-approve"
                :disabled="reviewingApplicantId === member.id"
                @click.stop="handleReview(member, 'approve')"
              >
                通过
              </button>
              <button
                class="member-review-button member-review-reject"
                :disabled="reviewingApplicantId === member.id"
                @click.stop="handleReview(member, 'reject')"
              >
                拒绝
              </button>
            </view>
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

      <button 
        v-if="!hasApplied" 
        class="apply-button" 
        :class="{ 'apply-button-pending': applying }"
        hover-class="apply-button-hover" 
        @click="handleApply"
      >
        {{ applying ? '提交中...' : '申请加入' }}
      </button>
      <button 
        v-else-if="applyStatus === 'pending'" 
        class="apply-button apply-button-pending" 
        disabled
      >
        申请审核中
      </button>
      <button 
        v-else-if="applyStatus === 'joined'" 
        class="apply-button apply-button-success" 
        disabled
      >
        已加入
      </button>
      <button 
        v-else-if="applyStatus === 'rejected'" 
        class="apply-button apply-button-rejected" 
        @click="handleApply"
      >
        {{ applying ? '提交中...' : '重新申请' }}
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

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid rgba(255, 247, 240, 0.16);
  border-top-color: $brand-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  color: rgba(244, 244, 244, 0.5);
  font-size: 28rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.member-status {
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(244, 244, 244, 0.1);
  color: rgba(244, 244, 244, 0.64);
  font-size: 18rpx;
}

.member-review-actions {
  display: flex;
  gap: 10rpx;
  margin-top: 10rpx;
}

.member-review-button {
  min-width: 88rpx;
  height: 42rpx;
  padding: 0 12rpx;
  border: 0;
  border-radius: 999rpx;
  font-size: 18rpx;
  line-height: 1;
}

.member-review-button::after {
  border: 0;
}

.member-review-approve {
  background: rgba(34, 150, 111, 0.22);
  color: rgba(34, 150, 111, 0.95);
}

.member-review-reject {
  background: rgba(239, 68, 68, 0.18);
  color: rgba(239, 68, 68, 0.9);
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

.apply-button-pending {
  background: rgba(244, 244, 244, 0.2);
  color: rgba(244, 244, 244, 0.6);
}

.apply-button-success {
  background: rgba(34, 150, 111, 0.3);
  color: rgba(34, 150, 111, 0.9);
}

.apply-button-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: rgba(239, 68, 68, 0.8);
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

  .member-status {
    margin-top: 6px;
    padding: 3px 8px;
    font-size: 11px;
  }

  .member-review-actions {
    gap: 8px;
    margin-top: 8px;
  }

  .member-review-button {
    min-width: 64px;
    height: 30px;
    padding: 0 10px;
    font-size: 12px;
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
