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
