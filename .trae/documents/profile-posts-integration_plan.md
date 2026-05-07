# 个人中心帖子对接计划

## 需求分析

用户希望作者发布的帖子（笔记）能够在作者自己的个人中心页面展示。当前个人中心显示的帖子来自 `ProfilePost` 表的假数据，需要改为从 `CommunityPost` 表获取用户真实发布的帖子。

## 当前架构分析

### 前端
- **页面**: `app/src/pages/profile/index.vue`
- **数据来源**: `authStore.profile.posts`
- **期望格式**: `{ id, cover, kind }`

### 后端
- **Profile Service**: `service/src/profile/profile.service.ts` - 当前从 `profilePost` 表获取假数据
- **Community Service**: `service/src/community/community.service.ts` - 管理真实帖子数据
- **数据库**: `CommunityPost` 表包含用户发布的真实帖子，通过 `userId` 关联

## 实现方案

### 方案一（推荐）：修改 ProfileService
直接在 `ProfileService` 中查询 `CommunityPost` 表获取用户帖子，保持后端接口不变。

### 修改内容

1. **后端 - ProfileService** (`service/src/profile/profile.service.ts`)
   - 修改 `getMine()` 方法，从 `communityPost` 表获取用户帖子
   - 保留 `profilePost` 表用于存储收藏内容（`kind: 'saved'`）

2. **后端 - CommunityService** (`service/src/community/community.service.ts`)
   - 添加 `getPostsByUserId()` 方法供 ProfileService 调用

3. **前端 - Profile 页面** (`app/src/pages/profile/index.vue`)
   - 无需修改，接口响应格式保持一致

## 详细步骤

### 步骤 1：在 CommunityService 添加按用户查询帖子方法

**文件**: `service/src/community/community.service.ts`

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
    include: {
      media: {
        orderBy: { sort: 'asc' },
      },
    },
  });

  return posts.map(post => ({
    id: post.id,
    cover: post.media[0]?.url || DEFAULT_POST_COVER,
    kind: 'post' as const,
  }));
}
```

### 步骤 2：修改 ProfileService 获取真实帖子

**文件**: `service/src/profile/profile.service.ts`

- 删除 `DEFAULT_POSTS` 常量（不再需要假数据）
- 修改 `getMine()` 方法，从 `CommunityPost` 获取用户帖子
- 保留 `profilePost` 表用于收藏内容

### 步骤 3：更新 Module 注入依赖

**文件**: `service/src/profile/profile.module.ts`

需要确保 `ProfileModule` 能访问 `CommunityService` 或直接使用 `PrismaService` 查询。

## 风险评估

| 风险 | 等级 | 应对措施 |
|------|------|----------|
| 数据迁移 | 低 | 新用户发布的帖子自动显示，历史假数据不影响 |
| 接口变更 | 低 | 保持响应格式不变，前端无需修改 |
| 性能影响 | 低 | 已有索引 `@@index([userId, createdAt])` |

## 测试验证

1. 创建帖子后，在个人中心能看到
2. 帖子按创建时间倒序排列
3. 收藏内容仍然显示（`kind: 'saved'`）

## 预期结果

用户发布的帖子会自动在个人中心"笔记"标签页显示，无需前端修改。

---

**计划状态**: 待审批