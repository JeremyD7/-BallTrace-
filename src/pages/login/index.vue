<script setup>
import { computed, ref } from 'vue'

const account = ref('')
const password = ref('')
const agreed = ref(true)
const showPassword = ref(false)

const canLogin = computed(() => account.value.trim().length > 0 && password.value.trim().length > 0 && agreed.value)

function handleLogin() {
  if (!account.value.trim()) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none'
    })
    return
  }

  if (!password.value.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  if (!agreed.value) {
    uni.showToast({
      title: '请先同意服务协议和隐私协议',
      icon: 'none'
    })
    return
  }

  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function toggleAgreement() {
  agreed.value = !agreed.value
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <view class="login-page">
    <view class="login-shell">
      <view class="brand-block">
        <image class="brand-logo" src="@/static/images/logo.png" mode="aspectFit" />
        <view class="brand-copy">
          <text class="brand-mark">BALLTRACE</text>
          <text class="brand-title">欢迎登录球迹派</text>
          <text class="brand-subtitle">连接你的篮球生活</text>
        </view>
      </view>

      <view class="login-card">
        <text class="card-title">账号密码登录</text>
        <text class="card-desc"></text>

        <view class="form-field">
          <text class="field-label">账号</text>
          <input v-model="account" class="form-input" maxlength="32" placeholder="请输入账号"
            placeholder-class="form-placeholder" />
        </view>

        <view class="form-field form-field-password">
          <text class="field-label">密码</text>
          <view class="password-row">
            <input v-model="password" class="form-input password-input" :password="!showPassword" maxlength="32"
              placeholder="请输入密码" placeholder-class="form-placeholder" />
            <text class="password-toggle" @click.stop="togglePasswordVisibility">
              {{ showPassword ? 'hide' : 'show' }}
            </text>
          </view>
        </view>

        <button class="login-button" :class="{ 'login-button-disabled': !canLogin }" hover-class="login-button-hover"
          @click="handleLogin">
          登录
        </button>

        <view class="agreement-row" @click="toggleAgreement">
          <view class="agreement-check" :class="{ 'agreement-check-active': agreed }">
            <text class="agreement-check-icon">{{ agreed ? '✓' : '' }}</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意《服务协议》和《隐私协议》
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/uni.scss';

.login-page {
  min-height: 100vh;
  padding: 56rpx 28rpx 72rpx;
  background:
    radial-gradient(circle at top left, rgba(217, 122, 63, 0.28), transparent 34%),
    radial-gradient(circle at bottom right, rgba(217, 122, 63, 0.18), transparent 28%),
    linear-gradient(180deg, #171514 0%, #111111 48%, #181513 100%);
}

.login-shell {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 128rpx);
  justify-content: center;
  gap: 52rpx;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 8rpx 0;
}

.brand-logo {
  width: 180rpx;
  height: 88rpx;
  flex-shrink: 0;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.brand-mark {
  color: rgba(255, 247, 240, 0.72);
  font-size: 22rpx;
  letter-spacing: 6rpx;
}

.brand-title {
  color: #fff7f0;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.16;
}

.brand-subtitle {
  color: rgba(255, 247, 240, 0.72);
  font-size: 26rpx;
  line-height: 1.65;
}

.login-card {
  padding: 40rpx 32rpx 36rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 32rpx;
  background:
    linear-gradient(180deg, rgba(255, 248, 239, 0.08) 0%, rgba(255, 248, 239, 0.04) 100%),
    rgba(20, 18, 17, 0.92);
  box-shadow: 0 28rpx 80rpx rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18rpx);
}

.card-title {
  display: block;
  color: #fff7f0;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.3;
}

.card-desc {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 247, 240, 0.62);
  font-size: 24rpx;
  line-height: 1.6;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 40rpx;
  padding: 0 24rpx;
  border: 2rpx solid rgba(217, 122, 63, 0.18);
  border-radius: 24rpx;
  background: rgba(255, 248, 239, 0.06);
  box-shadow: inset 0 0 0 1rpx rgba(255, 247, 240, 0.03);
}

.form-field-password {
  margin-top: 24rpx;
}

.field-label {
  padding-top: 22rpx;
  color: rgba(255, 247, 240, 0.72);
  font-size: 24rpx;
  line-height: 1.3;
}

.form-input {
  height: 96rpx;
  color: #fff7f0;
  font-size: 30rpx;
}

.password-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.password-input {
  flex: 1;
}

.password-toggle {
  flex-shrink: 0;
  color: $brand-color;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.3;
}

.form-placeholder {
  color: rgba(255, 247, 240, 0.3);
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100rpx;
  margin-top: 32rpx;
  padding: 0;
  border: 0;
  border-radius: 24rpx;
  background: linear-gradient(135deg, $brand-color 0%, #c9682b 100%);
  color: $brand-text-on-color;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 18rpx 44rpx $brand-shadow-soft;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.login-button::after {
  border: 0;
}

.login-button-hover {
  transform: translateY(2rpx);
  box-shadow: 0 10rpx 24rpx $brand-shadow-strong;
}

.login-button-disabled {
  opacity: 0.46;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 30rpx;
}

.agreement-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  margin-top: 4rpx;
  border: 2rpx solid rgba(255, 247, 240, 0.24);
  border-radius: 50%;
  background: rgba(255, 248, 239, 0.04);
  flex-shrink: 0;
}

.agreement-check-active {
  border-color: $brand-color;
  background: rgba(217, 122, 63, 0.16);
}

.agreement-check-icon {
  color: $brand-color;
  font-size: 20rpx;
  line-height: 1;
}

.agreement-text {
  color: rgba(255, 247, 240, 0.62);
  font-size: 24rpx;
  line-height: 1.6;
}

@media screen and (min-width: 768px) {
  .login-page {
    padding: 48px 24px 64px;
  }

  .login-shell {
    max-width: 960px;
    min-height: calc(100vh - 112px);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 460px);
    align-items: center;
    gap: 32px;
  }

  .brand-block {
    align-items: flex-start;
    gap: 20px;
    padding: 0;
  }

  .brand-logo {
    width: 132px;
    height: 62px;
  }

  .brand-mark {
    font-size: 12px;
    letter-spacing: 5px;
  }

  .brand-title {
    font-size: 42px;
  }

  .brand-subtitle {
    max-width: 420px;
    font-size: 16px;
  }

  .login-card {
    padding: 32px;
    border-radius: 28px;
  }

  .card-title {
    font-size: 28px;
  }

  .card-desc {
    margin-top: 10px;
    font-size: 14px;
  }

  .form-field {
    margin-top: 28px;
    gap: 10px;
    padding: 0 18px;
    border-width: 1px;
    border-radius: 20px;
  }

  .form-field-password {
    margin-top: 16px;
  }

  .field-label {
    padding-top: 16px;
    font-size: 14px;
  }

  .form-input {
    height: 64px;
    font-size: 18px;
  }

  .password-row {
    gap: 12px;
  }

  .password-toggle {
    font-size: 14px;
  }

  .login-button {
    height: 62px;
    margin-top: 22px;
    border-radius: 20px;
    font-size: 18px;
  }

  .agreement-row {
    gap: 12px;
    margin-top: 22px;
  }

  .agreement-check {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    border-width: 1px;
  }

  .agreement-check-icon {
    font-size: 12px;
  }

  .agreement-text {
    font-size: 14px;
  }
}
</style>
