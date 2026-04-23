import { request } from './http.js'

export function login(payload) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: payload
  })
}

export function register(payload) {
  return request({
    url: '/auth/register',
    method: 'POST',
    data: payload
  })
}
