import { request } from './http'

export function getMessageOverview() {
  return request({
    url: '/messages/overview'
  })
}

export function getExploreMessages() {
  return request({
    url: '/messages/explore'
  })
}

export function getMatchMessages() {
  return request({
    url: '/messages/matches'
  })
}

export function getSystemMessages() {
  return request({
    url: '/messages/system'
  })
}

export function getDirectMessages() {
  return request({
    url: '/messages/direct'
  })
}
