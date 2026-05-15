import { request, BASE_URL } from './http'

export function getCommunityFeed(params = {}) {
  return request({
    url: '/community/posts',
    data: params
  })
}

export function searchCommunityPosts(keyword) {
  return request({
    url: '/community/posts/search',
    data: {
      keyword
    }
  })
}

export function getMyCommunityPosts() {
  return request({
    url: '/community/posts/my'
  })
}

export function createCommunityPost(data) {
  return request({
    url: '/community/posts',
    method: 'POST',
    data
  })
}

export function uploadCommunityMedia(files) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('balltrace_token') || ''
    const uploadTasks = []
    
    // 逐个上传文件
    files.forEach((file) => {
      const uploadTask = new Promise((res, rej) => {
        uni.uploadFile({
          url: `${BASE_URL}/upload/media`,
          filePath: file.tempFilePath || file.path,
          name: 'files',
          header: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          success: (response) => {
            try {
              const data = JSON.parse(response.data)
              if (response.statusCode >= 200 && response.statusCode < 300) {
                res(data)
              } else {
                rej(new Error(data.message || '上传失败'))
              }
            } catch (error) {
              rej(new Error('解析响应失败'))
            }
          },
          fail: (error) => {
            rej(new Error(error?.errMsg || '网络异常'))
          }
        })
      })
      uploadTasks.push(uploadTask)
    })

    // 等待所有文件上传完成
    Promise.all(uploadTasks).then((results) => {
      // 合并所有上传结果
      const allData = []
      results.forEach((result) => {
        if (result.data && result.data.length > 0) {
          allData.push(...result.data)
        }
      })
      resolve({
        success: true,
        message: '上传成功',
        data: allData
      })
    }).catch(reject)
  })
}

export function getCommunityPostDetail(id) {
  return request({
    url: `/community/posts/${id}`
  })
}

export function getCommunityPostComments(postId) {
  return request({
    url: `/community/posts/${postId}/comments`
  })
}

export function likeCommunityPost(id) {
  return request({
    url: `/community/posts/${id}/like`,
    method: 'POST'
  })
}

export function createCommunityComment(postId, data) {
  return request({
    url: `/community/posts/${postId}/comments`,
    method: 'POST',
    data
  })
}
