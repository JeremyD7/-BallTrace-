import { request } from './http'

export function getMatchPosts(params = {}) {
  return request({
    url: '/matches',
    data: params
  })
}

export function getMatchPostDetail(id) {
  return request({
    url: `/matches/${id}`
  })
}

export function createMatchPost(data) {
  return request({
    url: '/matches',
    method: 'POST',
    data
  })
}

export function applyMatchPost(id, data = {}) {
  return request({
    url: `/matches/${id}/apply`,
    method: 'POST',
    data
  })
}
