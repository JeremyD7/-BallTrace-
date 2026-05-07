# 个人中心帖子格式对接计划

## 需求分析

用户希望个人中心展示的帖子格式与首页帖子格式一致，包含完整的帖子信息：
- 当前首页帖子格式（由 `mapPostListItem` 生成）：
  - id, title, content, author, avatar, cover, likes, comments, tags, publishedAt
- 当前个人中心帖子格式：
  - id, cover, kind

## 当前架构分析

### 首页帖子格式
**后端**: `mapPostListItem()` 函数生成完整帖子列表项格式
**前端**: `PostWaterfallCard.vue` 组件使用这些字段

### 个人中心帖子格式
**后端**: `ProfileService.getMine()` 返回简化格式 `{ id, cover, kind }`
**前端**: `profile/index.vue` 使用简化格式仅显示封面图

## 实现方案

### 方案：统一帖子格式

修改后端服务，使个人中心返回的帖子格式与首页一致。

### 修改内容

1. **后端 - CommunityService** (`service/src/community/community.service.ts`)
   - 修改 `getPostsByUserId()` 方法，返回完整帖子列表项格式

2. **后端 - ProfileService** (`service/src/profile/profile.service.ts`)
   - 修改 `getMine()` 方法，返回完整帖子列表项格式

3. **前端 - Profile 页面** (`app/src/pages/profile/index.vue`)
   - 修改帖子展示方式，使用完整的帖子字段
   - 可以复用 `PostWaterfallCard.vue` 组件或自定义展示

## 详细步骤

### 步骤 1：修改 CommunityService.getPostsByUserId

修改返回格式为完整的帖子列表项格式：

```typescript
async getPostsByUserId(userId: number) {
  const posts = await this.prisma.communityPost.findMany({
    where: {
      userId,
      status: POST_STATUS_PUBLISHED,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: POST_INCLUDE,
  });

  return posts.map(mapPostListItem);
}
```

### 步骤 2：修改 ProfileService.getMine

修改帖子查询和返回格式：

```typescript
const communityPosts = await this.prisma.communityPost.findMany({
  where: { userId, status: 'published' },
  orderBy: { createdAt: 'desc' },
  include: {
    author: true,
    media: { orderBy: { sort: 'asc' } },
    tags: { orderBy: { sort: 'asc' } },
  },
});

const posts = [
  ...communityPosts.map(post => ({
    ...mapPostListItem(post),
    kind: 'post' as const,
  })),
  ...savedPosts.map(({ id, cover }) => ({
    id,
    cover,
    kind: 'saved' as const,
  })),
];
```

### 步骤 3：修改前端 Profile 页面

修改个人中心页面，使用完整的帖子格式展示：
- 添加 `PostWaterfallCard` 组件
- 或自定义展示完整帖子信息

## 预期结果

- 个人中心"笔记"栏显示完整的帖子信息（标题、作者、点赞数等）
- 格式与首页帖子一致
- 收藏内容保持原有简化格式

---

**计划状态**: 待审批