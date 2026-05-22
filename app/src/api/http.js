function getBaseUrl() {
  const stored = uni.getStorageSync('balltrace_api_url')
  if (stored) {
    return stored
  }
  return 'http://localhost:3000'
}

const TOKEN_KEY = 'balltrace_token'
const LEGACY_AUTH_KEY = 'balltrace_auth'

function getToken() {
  const token = uni.getStorageSync(TOKEN_KEY)

  if (token) {
    return token
  }

  const legacyAuth = uni.getStorageSync(LEGACY_AUTH_KEY)
  return legacyAuth?.accessToken || ''
}

function getErrorMessage(payload, fallback = '请求失败，请稍后重试') {
  if (!payload) {
    return fallback
  }

  if (typeof payload === 'string') {
    return payload
  }

  if (Array.isArray(payload.message) && payload.message.length > 0) {
    return payload.message[0]
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  return fallback
}

export function request({ url, method = 'GET', data, header = {} }) {
  return new Promise((resolve, reject) => {
    const token = getToken()

    uni.request({
      url: `${getBaseUrl()}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header
      },
      success: (response) => {
        const { statusCode, data: responseData } = response

        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData)
          return
        }

        reject(new Error(getErrorMessage(responseData)))
      },
      fail: (error) => {
        reject(new Error(getErrorMessage(error?.errMsg, '网络异常，请检查后端服务是否启动')))
      }
    })
  })
}

export { getBaseUrl as BASE_URL }
