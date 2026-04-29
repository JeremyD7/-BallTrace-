const BASE_URL = 'http://localhost:3000'

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
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
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

export { BASE_URL }
