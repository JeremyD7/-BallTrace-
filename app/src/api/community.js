import { request } from './http'

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

export function createCommunityPost(data) {
  return request({
    url: '/community/posts',
    method: 'POST',
    data
  })
}

export function uploadCommunityMedia(filePath) {
  return request({
    url: '/community/media',
    method: 'POST',
    data: {
      filePath
    }
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
