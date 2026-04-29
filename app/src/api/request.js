const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000'

export function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      success: ({ statusCode, data }) => {
        if (statusCode >= 200 && statusCode < 300) {
          resolve(data)
          return
        }

        reject(new Error(data?.message || 'Request failed'))
      },
      fail: () => reject(new Error('Network error'))
    })
  })
}
