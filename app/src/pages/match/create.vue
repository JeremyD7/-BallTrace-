<script setup>
import { computed, ref } from 'vue'

const form = ref({
  area: '成华区',
  courtName: '奥林匹克篮球中心',
  matchDate: '08月05日',
  startTime: '16:00',
  endTime: '18:00',
  matchType: '1v1',
  level: '中级',
  genderLimit: '不限男女',
  total: 4,
  price: '约40元',
  feeRule: '发起人与球友AA',
  slogan: '',
  note: ''
})

const typeOptions = ['1v1', '3v3', '半场', '全场']
const levelOptions = ['新手友好', '中级', '进阶', '娱乐局']
const genderOptions = ['不限男女', '仅限男生', '仅限女生']

const canPublish = computed(() => {
  return Boolean(
    form.value.area.trim() &&
      form.value.courtName.trim() &&
      form.value.matchDate.trim() &&
      form.value.startTime.trim() &&
      form.value.endTime.trim() &&
      form.value.slogan.trim()
  )
})

function handleBack() {
  uni.navigateBack({
    fail() {
      uni.reLaunch({
        url: '/pages/match/index'
      })
    }
  })
}

function setOption(key, value) {
  form.value[key] = value
}

function stepTotal(delta) {
  const next = Number(form.value.total) + delta
  form.value.total = Math.min(Math.max(next, 2), 20)
}

function buildPayload() {
  return {
    area: form.value.area.trim(),
    courtName: form.value.courtName.trim(),
    matchDate: form.value.matchDate.trim(),
    startTime: form.value.startTime.trim(),
    endTime: form.value.endTime.trim(),
    matchType: form.value.matchType,
    level: form.value.level,
    genderLimit: form.value.genderLimit,
    total: Number(form.value.total),
    price: form.value.price.trim(),
    feeRule: form.value.feeRule.trim(),
    slogan: form.value.slogan.trim(),
    note: form.value.note.trim()
  }
}

function handlePublish() {
  if (!canPublish.value) {
    uni.showToast({
      title: '请完善约球信息',
      icon: 'none'
    })
    return
  }

  const payload = buildPayload()
  console.log('create match payload', payload)

  uni.showToast({
    title: '发布约球接口待接入',
    icon: 'none'
  })
}
</script>

<template>
  <view class="create-match-page">
    <scroll-view class="create-match-scroll" scroll-y>
      <view class="create-match-shell">
        <view class="topbar">
          <text class="topbar-back" @click="handleBack">‹</text>
          <text class="topbar-title">发布约球</text>
          <text
            class="topbar-submit"
            :class="{ 'topbar-submit-disabled': !canPublish }"
            @click="handlePublish"
          >
            发布
          </text>
        </view>

        <view class="hero-panel">
          <text class="hero-title">发起一场靠谱球局</text>
          <text class="hero-copy">补齐时间、地点、人数和水平要求，后端接入后可直接提交。</text>
        </view>

        <view class="form-section">
          <text class="section-title">球局地点</text>
          <view class="input-card">
            <text class="input-label">区域</text>
            <input v-model="form.area" class="form-input" placeholder="例如：成华区" placeholder-class="input-placeholder" />
          </view>
          <view class="input-card">
            <text class="input-label">球场</text>
            <input v-model="form.courtName" class="form-input" placeholder="填写球场名称" placeholder-class="input-placeholder" />
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">球局时间</text>
          <view class="time-row">
            <view class="time-card">
              <text class="input-label">日期</text>
              <input v-model="form.matchDate" class="form-input" placeholder="08月05日" placeholder-class="input-placeholder" />
            </view>
            <view class="time-card">
              <text class="input-label">开始</text>
              <input v-model="form.startTime" class="form-input" placeholder="16:00" placeholder-class="input-placeholder" />
            </view>
            <view class="time-card">
              <text class="input-label">结束</text>
              <input v-model="form.endTime" class="form-input" placeholder="18:00" placeholder-class="input-placeholder" />
            </view>
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">球局类型</text>
          <view class="option-row">
            <text
              v-for="item in typeOptions"
              :key="item"
              class="option-pill"
              :class="{ 'option-pill-active': form.matchType === item }"
              @click="setOption('matchType', item)"
            >
              {{ item }}
            </text>
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">参与要求</text>
          <view class="option-row">
            <text
              v-for="item in levelOptions"
              :key="item"
              class="option-pill"
              :class="{ 'option-pill-active': form.level === item }"
              @click="setOption('level', item)"
            >
              {{ item }}
            </text>
          </view>
          <view class="option-row option-row-gap">
            <text
              v-for="item in genderOptions"
              :key="item"
              class="option-pill"
              :class="{ 'option-pill-active': form.genderLimit === item }"
              @click="setOption('genderLimit', item)"
            >
              {{ item }}
            </text>
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">人数与费用</text>
          <view class="setting-line">
            <view class="setting-copy">
              <text class="setting-title">目标人数</text>
              <text class="setting-caption">包含发起人在内</text>
            </view>
            <view class="stepper">
              <text class="stepper-button" @click="stepTotal(-1)">-</text>
              <text class="stepper-value">{{ form.total }}</text>
              <text class="stepper-button" @click="stepTotal(1)">+</text>
            </view>
          </view>
          <view class="input-card">
            <text class="input-label">费用参考</text>
            <input v-model="form.price" class="form-input" placeholder="例如：约40元" placeholder-class="input-placeholder" />
          </view>
          <view class="input-card">
            <text class="input-label">费用规则</text>
            <input v-model="form.feeRule" class="form-input" placeholder="例如：场地AA" placeholder-class="input-placeholder" />
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">约球宣言</text>
          <view class="textarea-card">
            <textarea
              v-model="form.slogan"
              class="form-textarea"
              maxlength="120"
              placeholder="说清楚这场球的节奏、氛围和希望找到什么样的球友"
              placeholder-class="input-placeholder"
            />
          </view>
          <text class="field-count">{{ form.slogan.length }}/120</text>
        </view>

        <view class="form-section">
          <text class="section-title">补充说明</text>
          <view class="textarea-card textarea-card-small">
            <textarea
              v-model="form.note"
              class="form-textarea form-textarea-small"
              maxlength="160"
              placeholder="可填写停车、更衣室、天气或迟到规则等信息"
              placeholder-class="input-placeholder"
            />
          </view>
          <text class="field-count">{{ form.note.length }}/160</text>
        </view>

        <button class="publish-button" hover-class="publish-button-hover" @click="handlePublish">
          发布约球
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.create-match-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(217, 122, 63, 0.2), transparent 24%),
    linear-gradient(180deg, #121110 0%, #111111 46%, #151311 100%);
}

.create-match-scroll {
  min-height: 100vh;
}

.create-match-shell {
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

.hero-panel {
  margin-top: 36rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(217, 122, 63, 0.22);
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(217, 122, 63, 0.18), rgba(36, 35, 35, 0.95));
}

.hero-title {
  display: block;
  color: #fff7f0;
  font-size: 36rpx;
  font-weight: 700;
}

.hero-copy {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 247, 240, 0.62);
  font-size: 24rpx;
  line-height: 1.7;
}

.form-section {
  margin-top: 34rpx;
}

.section-title {
  display: block;
  color: #f4f4f4;
  font-size: 30rpx;
  font-weight: 600;
}

.input-card,
.time-card,
.setting-line,
.textarea-card {
  margin-top: 18rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 24rpx;
  background: rgba(36, 35, 35, 0.94);
}

.input-card,
.time-card {
  padding: 18rpx 22rpx;
}

.input-label {
  display: block;
  color: rgba(244, 244, 244, 0.45);
  font-size: 22rpx;
}

.form-input {
  width: 100%;
  height: 52rpx;
  margin-top: 6rpx;
  color: #f4f4f4;
  font-size: 28rpx;
}

.input-placeholder {
  color: rgba(244, 244, 244, 0.34);
}

.time-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.time-card {
  width: 31%;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  margin-top: 18rpx;
}

.option-row-gap {
  margin-top: 10rpx;
}

.option-pill {
  margin-right: 14rpx;
  margin-bottom: 14rpx;
  padding: 14rpx 20rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.1);
  border-radius: 999rpx;
  background: rgba(36, 35, 35, 0.94);
  color: rgba(255, 247, 240, 0.72);
  font-size: 24rpx;
}

.option-pill-active {
  border-color: rgba(217, 122, 63, 0.72);
  background: rgba(217, 122, 63, 0.16);
  color: $brand-color;
  font-weight: 700;
}

.setting-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.setting-copy {
  flex: 1;
  min-width: 0;
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

.stepper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.stepper-button,
.stepper-value {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-button {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(217, 122, 63, 0.18);
  color: $brand-color;
  font-size: 34rpx;
  font-weight: 700;
}

.stepper-value {
  width: 66rpx;
  color: #fff7f0;
  font-size: 30rpx;
  font-weight: 700;
}

.textarea-card {
  min-height: 220rpx;
  padding: 22rpx 24rpx;
}

.textarea-card-small {
  min-height: 170rpx;
}

.form-textarea {
  width: 100%;
  min-height: 176rpx;
  color: #f4f4f4;
  font-size: 28rpx;
  line-height: 1.6;
}

.form-textarea-small {
  min-height: 126rpx;
}

.field-count {
  display: block;
  margin-top: 10rpx;
  text-align: right;
  color: rgba(244, 244, 244, 0.38);
  font-size: 22rpx;
}

.publish-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100rpx;
  margin-top: 34rpx;
  border: 0;
  border-radius: 24rpx;
  background: $brand-color;
  color: #111111;
  font-size: 32rpx;
  font-weight: 700;
}

.publish-button::after {
  border: 0;
}

.publish-button-hover {
  opacity: 0.88;
}

@media screen and (min-width: 768px) {
  .create-match-shell {
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

  .hero-panel {
    margin-top: 28px;
    padding: 24px;
    border-radius: 22px;
    border-width: 1px;
  }

  .hero-title {
    font-size: 26px;
  }

  .hero-copy,
  .option-pill {
    font-size: 14px;
  }

  .form-section {
    margin-top: 28px;
  }

  .section-title {
    font-size: 18px;
  }

  .input-card,
  .time-card,
  .setting-line,
  .textarea-card {
    margin-top: 12px;
    border-radius: 18px;
    border-width: 1px;
  }

  .input-card,
  .time-card {
    padding: 12px 16px;
  }

  .input-label,
  .setting-caption,
  .field-count {
    font-size: 13px;
  }

  .form-input,
  .form-textarea {
    font-size: 16px;
  }

  .option-row {
    margin-top: 12px;
  }

  .option-pill {
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 8px 14px;
    border-width: 1px;
  }

  .setting-line {
    padding: 16px;
  }

  .setting-title {
    font-size: 16px;
  }

  .stepper-button {
    width: 34px;
    height: 34px;
    font-size: 22px;
  }

  .stepper-value {
    width: 44px;
    font-size: 18px;
  }

  .textarea-card {
    min-height: 168px;
    padding: 16px;
  }

  .textarea-card-small {
    min-height: 126px;
  }

  .form-textarea {
    min-height: 132px;
  }

  .form-textarea-small {
    min-height: 90px;
  }

  .publish-button {
    height: 62px;
    margin-top: 28px;
    border-radius: 18px;
    font-size: 18px;
  }
}
</style>
