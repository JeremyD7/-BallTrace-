<script setup>
import { computed, ref } from 'vue'
import { login, register } from '@/api/auth'

const AUTH_STORAGE_KEY = 'balltrace_auth'

const mode = ref('login')
const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreed = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSwitching = ref(false)
const isSubmitting = ref(false)

const isRegisterMode = computed(() => mode.value === 'register')
const cardTitle = computed(() => (isRegisterMode.value ? '创建你的账号' : '账号密码登录'))
const cardDesc = computed(() =>
  isRegisterMode.value
    ? '注册后即可记录比赛、发布约球并管理个人资料'
    : '欢迎回来，继续你的球场记录与约球旅程'
)
const submitText = computed(() => {
  if (isSubmitting.value) {
    return isRegisterMode.value ? '注册中...' : '登录中...'
  }

  return isRegisterMode.value ? '注册并登录' : '登录'
})
const switchPrompt = computed(() => (isRegisterMode.value ? '已经有账号了？' : '还没有账号？'))
const switchActionText = computed(() => (isRegisterMode.value ? '去登录' : '去注册'))

const canSubmit = computed(() => {
  const hasBaseFields = account.value.trim().length > 0 && password.value.trim().length > 0 && agreed.value

  if (!isRegisterMode.value) {
    return hasBaseFields && !isSubmitting.value
  }

  return hasBaseFields && confirmPassword.value.trim().length > 0 && !isSubmitting.value
})

function switchMode(nextMode) {
  if (mode.value === nextMode || isSubmitting.value) {
    return
  }

  isSwitching.value = true
  mode.value = nextMode
  password.value = ''
  confirmPassword.value = ''
  showPassword.value = false
  showConfirmPassword.value = false

  setTimeout(() => {
    isSwitching.value = false
  }, 220)
}

function toggleMode() {
  switchMode(isRegisterMode.value ? 'login' : 'register')
}

function toggleAgreement() {
  agreed.value = !agreed.value
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value
}

function saveAuthSession(authResult) {
  uni.setStorageSync(AUTH_STORAGE_KEY, authResult)
}

function enterApp() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function showMessage(title) {
  uni.showToast({
    title,
    icon: 'none'
  })
}

function validateBaseFields() {
  if (!account.value.trim()) {
    showMessage('请输入账号')
    return false
  }

  if (account.value.trim().length < 4) {
    showMessage('账号至少4位')
    return false
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(account.value.trim())) {
    showMessage('账号仅支持字母数字下划线和短横线')
    return false
  }

  if (!password.value.trim()) {
    showMessage('请输入密码')
    return false
  }

  if (password.value.trim().length < 6) {
    showMessage('密码至少6位')
    return false
  }

  if (!agreed.value) {
    showMessage('请先同意服务协议和隐私协议')
    return false
  }

  return true
}

async function handleLogin() {
  const authResult = await login({
    account: account.value.trim(),
    password: password.value
  })

  saveAuthSession(authResult)
  enterApp()
}

async function handleRegister() {
  if (!confirmPassword.value.trim()) {
    showMessage('请确认密码')
    return
  }

  if (confirmPassword.value !== password.value) {
    showMessage('两次输入的密码不一致')
    return
  }

  const normalizedAccount = account.value.trim()
  const authResult = await register({
    account: normalizedAccount,
    password: password.value,
    nickname: normalizedAccount
  })

  saveAuthSession(authResult)

  uni.showToast({
    title: '注册成功',
    icon: 'success'
  })

  setTimeout(() => {
    enterApp()
  }, 300)
}

async function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  if (!validateBaseFields()) {
    return
  }

  isSubmitting.value = true

  try {
    if (isRegisterMode.value) {
      await handleRegister()
      return
    }

    await handleLogin()
  } catch (error) {
    showMessage(error?.message || '请求失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <view class="login-page">
    <view class="login-shell">
      <view class="brand-block">
        <image class="brand-logo" src="@/static/images/logo.png" mode="aspectFit" />
        <view class="brand-copy">
          <text class="brand-mark">BALLTRACE</text>
          <text class="brand-title">欢迎来到球迹</text>
          <text class="brand-subtitle">连接你的篮球生活，记录比赛、训练和每次约球</text>
        </view>
      </view>

      <view class="login-card">
        <view class="mode-switch">
          <view class="mode-switch-thumb" :class="{ 'mode-switch-thumb-register': isRegisterMode }"></view>
          <view
            class="mode-switch-item"
            :class="{ 'mode-switch-item-active': mode === 'login' }"
            @click="switchMode('login')"
          >
            <text class="mode-switch-text">登录</text>
          </view>
          <view
            class="mode-switch-item"
            :class="{ 'mode-switch-item-active': mode === 'register' }"
            @click="switchMode('register')"
          >
            <text class="mode-switch-text">注册</text>
          </view>
        </view>

        <view class="auth-copy" :class="{ 'auth-copy-switching': isSwitching }">
          <text class="card-title">{{ cardTitle }}</text>
          <text class="card-desc">{{ cardDesc }}</text>
        </view>

        <view class="form-field">
          <text class="field-label">账号</text>
          <input
            v-model="account"
            class="form-input"
            maxlength="32"
            placeholder="请输入账号"
            placeholder-class="form-placeholder"
          />
        </view>

        <view class="form-field form-field-password">
          <text class="field-label">密码</text>
          <view class="password-row">
            <input
              v-model="password"
              class="form-input password-input"
              :password="!showPassword"
              maxlength="32"
              placeholder="请输入密码"
              placeholder-class="form-placeholder"
            />
            <view class="password-toggle" @click.stop="togglePasswordVisibility">
              <image
                class="password-toggle-icon"
                :src="showPassword ? '/static/login/closeeye.svg' : '/static/login/eye.svg'"
                mode="aspectFit"
              />
            </view>
          </view>
        </view>

        <view class="confirm-field-shell" :class="{ 'confirm-field-shell-active': isRegisterMode }">
          <view class="form-field form-field-password confirm-field">
            <text class="field-label">确认密码</text>
            <view class="password-row">
              <input
                v-model="confirmPassword"
                class="form-input password-input"
                :password="!showConfirmPassword"
                maxlength="32"
                placeholder="请再次输入密码"
                placeholder-class="form-placeholder"
              />
              <view class="password-toggle" @click.stop="toggleConfirmPasswordVisibility">
                <image
                  class="password-toggle-icon"
                  :src="showConfirmPassword ? '/static/login/closeeye.svg' : '/static/login/eye.svg'"
                  mode="aspectFit"
                />
              </view>
            </view>
          </view>
        </view>

        <button
          class="login-button"
          :class="{ 'login-button-disabled': !canSubmit }"
          hover-class="login-button-hover"
          @click="handleSubmit"
        >
          <text class="submit-text" :class="{ 'submit-text-switching': isSwitching }">{{ submitText }}</text>
        </button>

        <view class="agreement-row" @click="toggleAgreement">
          <view class="agreement-check" :class="{ 'agreement-check-active': agreed }">
            <text class="agreement-check-icon">{{ agreed ? '✓' : '' }}</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意《服务协议》和《隐私协议》
          </text>
        </view>

        <view class="mode-helper">
          <text class="mode-helper-text">{{ switchPrompt }}</text>
          <text class="mode-helper-action" @click="toggleMode">{{ switchActionText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
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
  padding: 32rpx 32rpx 36rpx;
  border: 1rpx solid rgba(255, 247, 240, 0.08);
  border-radius: 32rpx;
  background:
    linear-gradient(180deg, rgba(255, 248, 239, 0.08) 0%, rgba(255, 248, 239, 0.04) 100%),
    rgba(20, 18, 17, 0.92);
  box-shadow: 0 28rpx 80rpx rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18rpx);
}

.mode-switch {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10rpx;
  width: 100%;
  padding: 10rpx;
  border-radius: 999rpx;
  background: rgba(255, 248, 239, 0.06);
  box-shadow: inset 0 0 0 1rpx rgba(255, 247, 240, 0.04);
  overflow: hidden;
}

.mode-switch-thumb {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  width: calc(50% - 15rpx);
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(198, 220, 85, 0.96) 0%, rgba(201, 104, 43, 0.96) 100%);
  box-shadow: 0 14rpx 28rpx rgba(198, 220, 85, 0.14);
  transition: transform 0.24s ease;
}

.mode-switch-thumb-register {
  transform: translateX(calc(100% + 10rpx));
}

.mode-switch-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 76rpx;
  border-radius: 999rpx;
  transition: transform 0.18s ease;
}

.mode-switch-text {
  color: rgba(255, 247, 240, 0.58);
  font-size: 28rpx;
  font-weight: 600;
  transition: color 0.24s ease;
}

.mode-switch-item-active .mode-switch-text {
  color: #111111;
}

.auth-copy {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.auth-copy-switching {
  opacity: 0.72;
  transform: translateY(4rpx);
}

.card-title {
  display: block;
  margin-top: 32rpx;
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
  margin-top: 32rpx;
  padding: 0 24rpx;
  border: 2rpx solid rgba(217, 122, 63, 0.18);
  border-radius: 24rpx;
  background: rgba(255, 248, 239, 0.06);
  box-shadow: inset 0 0 0 1rpx rgba(255, 247, 240, 0.03);
}

.form-field-password {
  margin-top: 24rpx;
}

.confirm-field-shell {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transform: translateY(-10rpx);
  transition: max-height 0.26s ease, opacity 0.2s ease, transform 0.26s ease;
}

.confirm-field-shell-active {
  max-height: 220rpx;
  opacity: 1;
  transform: translateY(0);
}

.confirm-field {
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
}

.password-toggle-icon {
  width: 34rpx;
  height: 34rpx;
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

.submit-text {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.submit-text-switching {
  opacity: 0.72;
  transform: translateY(2rpx);
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

.mode-helper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-top: 26rpx;
}

.mode-helper-text {
  color: rgba(255, 247, 240, 0.5);
  font-size: 24rpx;
}

.mode-helper-action {
  color: $brand-color;
  font-size: 24rpx;
  font-weight: 600;
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
    padding: 24px 32px 32px;
    border-radius: 28px;
  }

  .mode-switch {
    gap: 6px;
    padding: 6px;
  }

  .mode-switch-thumb {
    top: 6px;
    left: 6px;
    width: calc(50% - 9px);
    height: 48px;
  }

  .mode-switch-thumb-register {
    transform: translateX(calc(100% + 6px));
  }

  .mode-switch-item {
    height: 48px;
  }

  .mode-switch-text {
    font-size: 15px;
  }

  .card-title {
    margin-top: 24px;
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

  .confirm-field {
    margin-top: 16px;
  }

  .confirm-field-shell-active {
    max-height: 146px;
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
    width: 28px;
    height: 28px;
  }

  .password-toggle-icon {
    width: 18px;
    height: 18px;
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

  .agreement-text,
  .mode-helper-text,
  .mode-helper-action {
    font-size: 14px;
  }

  .mode-helper {
    gap: 8px;
    margin-top: 20px;
  }
}
</style>
