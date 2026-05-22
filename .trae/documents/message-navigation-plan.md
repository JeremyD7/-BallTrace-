# 消息列表点击跳转功能计划

## 需求分析
在消息列表页面，点击消息卡片时根据消息类型跳转到对应的详情页：
- **探索消息**（点赞、评论）→ 跳转到帖子详情页 `/pages/community/detail?id={postId}`
- **球局通知**（约球申请等）→ 跳转到约球详情页 `/pages/match/detail?id={matchId}`

## 需要修改的文件
1. `app/src/pages/message/index.vue` - 添加跳转逻辑

## 实现步骤

### 1. 修改消息数据结构
为 `panelMessages` 中的每条消息添加关联 ID：

**探索消息 (explore)** - 添加 `postId`：
```javascript
{
  id: 1,
  postId: 101,  // 新增
  actor: '张伟',
  action: '赞了你的笔记',
  title: '《投篮发力技巧分享》',
  time: '10分钟前',
  avatar: '/static/images/art_theman.jpg',
  body: ''
}
```

**球局通知 (match)** - 添加 `matchId`：
```javascript
{
  id: 1,
  matchId: 201,  // 新增
  actor: '李娜',
  action: '申请加入你发起的约球活动',
  title: '周六 16:00 成华体育中心',
  time: '10分钟前',
  status: '待处理'
}
```

### 2. 修改 handleMessageTap 函数
根据当前面板类型和消息数据，跳转到对应详情页：

```javascript
function handleMessageTap(item) {
  if (currentPanel.value === 'explore' && item.postId) {
    // 探索消息 -> 帖子详情
    uni.navigateTo({
      url: `/pages/community/detail?id=${item.postId}`
    })
  } else if (currentPanel.value === 'match' && item.matchId) {
    // 球局通知 -> 约球详情
    uni.navigateTo({
      url: `/pages/match/detail?id=${item.matchId}`
    })
  } else {
    // 如果没有 ID，显示提示
    uni.showToast({
      title: '详情页待接入',
      icon: 'none'
    })
  }
}
```

## 预期效果
1. 点击探索消息卡片中的任意消息，跳转到帖子详情页
2. 点击球局通知卡片中的任意消息，跳转到约球详情页
3. 消息卡片保持原有的交互体验

## 注意事项
- 模拟数据中使用虚拟 ID，实际开发中应使用真实的帖子/约球 ID
- 跳转后详情页会根据 ID 加载对应的内容
