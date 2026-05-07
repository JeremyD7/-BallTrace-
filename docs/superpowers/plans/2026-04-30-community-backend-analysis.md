# Community Backend Analysis

**目标：** 为 app 首页和社区页接入后端帖子能力，包括发帖、帖子流、帖子详情、评论与点赞。本文档先基于当前静态页面和 service 现状做分析，不直接改业务代码。

**范围：**
- 前端：`app/src/pages/index/index.vue`、`app/src/pages/community/index.vue`、`app/src/pages/community/create.vue`、`app/src/pages/community/detail.vue`、`app/src/components/PostWaterfallCard.vue`、`app/src/api/community.js`
- 后端：`service/src`、`service/prisma/schema.prisma`、Prisma migrations

**业务口径修正：**
这里的“社区”只是现有页面、路由和接口命名，本质不是一个真实社区系统，也不包含关注关系、圈子、社交关系或社区治理。第一版只按“帖子模块”实现：发帖、帖子流、帖子详情、点赞、评论。

---

## 1. 当前项目现状

### 前端 app

项目是 `uni-app + Vue 3 + Pinia`。登录态目前主要通过 `app/src/stores/auth.js` 保存：
- token storage key：`balltrace_token`
- user storage key：`balltrace_user`
- 鉴权请求使用 `app/src/api/request.js`，支持 `Authorization: Bearer <token>`

社区相关页面目前还是静态数据：
- 首页 `pages/index/index.vue` 展示 quickActions 和瀑布流帖子。
- 社区列表 `pages/community/index.vue` 展示推荐、最新、最热 tabs，支持本地搜索。
- 发布页 `pages/community/create.vue` 生成 payload，但只 `console.log`。
- 详情页 `pages/community/detail.vue` 固定使用 `defaultPost` 和 `defaultComments`，只读取路由 `id` 展示。
- `api/community.js` 已经预留了接口函数，但它引用的是 `./http`，该封装当前没有自动带 token。

需要注意：项目中同时存在两个请求封装：
- `app/src/api/request.js`：按 `request(path, options)` 调用，支持 token，auth store 正在使用。
- `app/src/api/http.js`：按 `request({ url, method, data })` 调用，不支持 token，community/auth API 模块正在使用。

建议后续统一社区接口使用 `request.js`，或增强 `http.js` 自动读取 token。为了改动面小，我建议增强 `http.js` 自动附加本地 token，同时保留现有函数签名。

### 后端 service

service 是 `NestJS + Prisma + PostgreSQL`。

已存在能力：
- `auth` 模块：注册、登录，返回 JWT。
- `JwtAuthGuard`：读取 `Authorization: Bearer <token>`，将 `request.user` 设置为 `{ id, account }`。
- `profile` 模块：`GET /profile/me`，使用登录用户 ID 读取个人页数据。
- `PrismaService`：基于 `DATABASE_URL` 或 `DIRECT_URL` 连接 PostgreSQL。

后端目前没有 community 模块，也没有帖子相关数据表。

---

## 2. 静态页面字段梳理

### 帖子列表卡片字段

来自首页、社区列表、`PostWaterfallCard`：

| 前端字段 | 用途 | 建议后端来源 |
| --- | --- | --- |
| `id` | 跳转详情 | `community_posts.id` |
| `title` | 卡片标题 | `community_posts.title` |
| `content` | 搜索/详情摘要来源 | `community_posts.content` |
| `author` | 卡片作者昵称 | `users.nickname` fallback `users.account` |
| `avatar` | 社区静态数据里已有，组件目前写死头像 | `users.avatar_url` |
| `cover` | 卡片封面图 | 第一张 `community_post_media.url`，无媒体时给默认图 |
| `likes` | 点赞数 | `community_posts.like_count` |
| `comments` | 评论数 | `community_posts.comment_count` |
| `tags` | 标签和搜索 | `community_post_tags.name` |
| `category` | recommend/latest/hot 过滤 | 可由 query 计算，不建议单独存静态分类 |
| `publishedAt` | 发布时间展示 | `community_posts.created_at` 格式化 |

### 发帖字段

来自 `pages/community/create.vue` 的 payload：

```js
{
  title,
  content,
  media,
  tags,
  visibility,
  allowComment,
  syncToCommunity
}
```

建议表字段：
- `title`：必填，最长 40
- `content`：必填，最长 1000
- `visibility`：`public` / `followers`
- `allow_comment`：是否允许评论
- `sync_to_community`：是否出现在帖子流。该字段来自当前静态发布页，后续也可以改名为 `show_in_feed`
- `status`：预留审核/草稿/删除，第一版使用 `published`
- `media`：独立媒体表，便于多图排序
- `tags`：独立标签表，便于搜索和详情展示

### 详情页字段

来自 `pages/community/detail.vue`：

| 前端字段 | 用途 | 建议后端来源 |
| --- | --- | --- |
| `id` | 帖子 ID | `community_posts.id` |
| `title` | 详情标题 | `community_posts.title` |
| `content` | 正文 | `community_posts.content` |
| `author.id/name/avatar` | 作者行 | `users` |
| `coverImages` | 图集轮播 | `community_post_media` |
| `likes` | 底部点赞数 | `community_posts.like_count` |
| `comments` | 评论标题计数 | `community_posts.comment_count` |
| `shares` | 分享数 | `community_posts.share_count` |
| `isLiked` | 当前用户是否已点赞 | `community_post_likes` |
| `tags` | 标签行 | `community_post_tags` |
| `publishedAt` | 发布时间 | `community_posts.created_at` |
| `location` | 详情 meta | 可选字段，静态页已展示 |

### 评论字段

来自详情页 `defaultComments`：

| 前端字段 | 用途 | 建议后端来源 |
| --- | --- | --- |
| `id` | 评论 ID | `community_comments.id` |
| `author.id/name/avatar` | 评论作者 | `users` |
| `content` | 评论内容 | `community_comments.content` |
| `likes` | 评论点赞数 | `community_comments.like_count` |
| `publishedAt` | 评论时间 | `community_comments.created_at` |
| `replies` | 回复列表 | 同一张评论表的 `parent_id` |

第一版可以实现一级评论和回复读取；如果前端暂时只发一级评论，接口仍预留 `parentId`。

---

## 3. 建议数据表设计

### Prisma models

建议在 `User` 增加关系：

```prisma
communityPosts    CommunityPost[]
communityComments CommunityComment[]
communityPostLikes CommunityPostLike[]
```

新增模型：

```prisma
model CommunityPost {
  id              Int      @id @default(autoincrement())
  userId          Int      @map("user_id")
  title           String   @db.VarChar(40)
  content         String   @db.VarChar(1000)
  location        String?  @db.VarChar(100)
  visibility      String   @default("public") @db.VarChar(16)
  allowComment    Boolean  @default(true) @map("allow_comment")
  syncToCommunity Boolean  @default(true) @map("sync_to_community")
  status          String   @default("published") @db.VarChar(16)
  likeCount       Int      @default(0) @map("like_count")
  commentCount    Int      @default(0) @map("comment_count")
  shareCount      Int      @default(0) @map("share_count")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")

  author   User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  media    CommunityPostMedia[]
  tags     CommunityPostTag[]
  comments CommunityComment[]
  likes    CommunityPostLike[]

  @@index([status, syncToCommunity, createdAt])
  @@index([userId, createdAt])
  @@map("community_posts")
}

model CommunityPostMedia {
  id        Int      @id @default(autoincrement())
  postId    Int      @map("post_id")
  url       String   @db.VarChar(255)
  type      String   @default("image") @db.VarChar(16)
  sort      Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, sort])
  @@map("community_post_media")
}

model CommunityPostTag {
  id     Int    @id @default(autoincrement())
  postId Int    @map("post_id")
  name   String @db.VarChar(32)
  sort   Int    @default(0)

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, sort])
  @@index([name])
  @@map("community_post_tags")
}

model CommunityPostLike {
  id        Int      @id @default(autoincrement())
  postId    Int      @map("post_id")
  userId    Int      @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([userId])
  @@map("community_post_likes")
}

model CommunityComment {
  id        Int      @id @default(autoincrement())
  postId    Int      @map("post_id")
  userId    Int      @map("user_id")
  parentId  Int?     @map("parent_id")
  content   String   @db.VarChar(500)
  likeCount Int      @default(0) @map("like_count")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")

  post    CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  author  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent  CommunityComment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies CommunityComment[] @relation("CommentReplies")

  @@index([postId, createdAt])
  @@index([parentId])
  @@map("community_comments")
}
```

### 为什么这样拆表

- 帖子主体、媒体、标签、点赞、评论分离，能覆盖当前静态页面全部字段。
- 点赞使用独立表，可保证同一用户只能点赞一次。
- 评论使用 `parent_id` 支持回复，不需要额外建回复表。
- 计数字段放在帖子表，列表查询不用每次聚合评论/点赞，接口更轻。
- `visibility`、`allow_comment`、`sync_to_community` 保留发布页已有设置，但不扩展成真实社区权限体系。

---

## 4. 建议后端接口设计

### 帖子读取接口

`GET /community/posts`

查询帖子流。这里沿用 `/community` 路由名，但语义是帖子列表。参数：
- `tab`: `recommend` | `latest` | `hot`
- `keyword`: 搜索关键字，可选
- `page`: 默认 1
- `pageSize`: 默认 10

返回建议：

```json
{
  "items": [
    {
      "id": 1,
      "title": "string",
      "content": "string",
      "author": "string",
      "avatar": "string",
      "cover": "string",
      "likes": 0,
      "comments": 0,
      "tags": ["string"],
      "publishedAt": "2026-04-30T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 0
}
```

`GET /community/posts/search`

可以保留以兼容 `api/community.js`，内部复用 `GET /community/posts?keyword=...`。

`GET /community/posts/:id`

返回详情：

```json
{
  "id": 1,
  "title": "string",
  "content": "string",
  "author": {
    "id": 1,
    "name": "string",
    "avatar": "string"
  },
  "coverImages": ["string"],
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "isLiked": false,
  "tags": ["string"],
  "publishedAt": "2026-04-30T00:00:00.000Z",
  "location": "string"
}
```

`GET /community/posts/:postId/comments`

返回评论列表，包含回复：

```json
[
  {
    "id": 1,
    "author": {
      "id": 1,
      "name": "string",
      "avatar": "string"
    },
    "content": "string",
    "likes": 0,
    "publishedAt": "2026-04-30T00:00:00.000Z",
    "replies": [
      {
        "id": 2,
        "authorName": "string",
        "content": "string"
      }
    ]
  }
]
```

### 需要登录的帖子操作接口

`POST /community/posts`

使用 `JwtAuthGuard`。请求体：

```json
{
  "title": "string",
  "content": "string",
  "media": [
    {
      "url": "string",
      "type": "image"
    }
  ],
  "tags": ["string"],
  "visibility": "public",
  "allowComment": true,
  "syncToCommunity": true,
  "location": "string"
}
```

`POST /community/posts/:id/like`

使用 `JwtAuthGuard`。建议做成 toggle：
- 未点赞：创建点赞记录，`like_count + 1`，返回 `isLiked: true`
- 已点赞：删除点赞记录，`like_count - 1`，返回 `isLiked: false`

`POST /community/posts/:postId/comments`

使用 `JwtAuthGuard`。请求体：

```json
{
  "content": "string",
  "parentId": 1
}
```

### 媒体上传接口

`POST /community/media`

当前前端 `uploadCommunityMedia(filePath)` 只是把 `filePath` 放进 JSON，这不能真正上传文件。第一阶段建议先不实现真实文件上传，发布时允许传本地静态 URL 或远程 URL。后续如果要做真实上传，需要改前端使用 `uni.uploadFile`，后端增加 `@nestjs/platform-express` 文件接收和存储策略。

---

## 5. 后端实现计划

### Task 1: Prisma 表结构和迁移

文件：
- 修改：`service/prisma/schema.prisma`
- 新增：`service/prisma/migrations/<timestamp>_community_posts/migration.sql`

工作：
- 增加 `CommunityPost`、`CommunityPostMedia`、`CommunityPostTag`、`CommunityPostLike`、`CommunityComment`。
- 给 `User` 增加对应关系字段。
- 生成或手写 migration SQL。
- 运行 `npm run prisma:validate` 和 `npm run prisma:generate`。

### Task 2: 新增 Community 模块

文件：
- 新增：`service/src/community/community.module.ts`
- 新增：`service/src/community/community.controller.ts`
- 新增：`service/src/community/community.service.ts`
- 新增：`service/src/community/dto/create-community-post.dto.ts`
- 新增：`service/src/community/dto/query-community-posts.dto.ts`
- 新增：`service/src/community/dto/create-community-comment.dto.ts`
- 修改：`service/src/app.module.ts`

工作：
- 实现帖子流查询、搜索、详情、评论列表、发帖、点赞、评论。
- DTO 使用 `class-validator`，保持当前项目风格。
- 详情接口可以读取可选 token：第一版若无 token，`isLiked` 返回 `false`；若后续需要精确判断，可加 optional auth guard。

### Task 3: 数据返回格式适配前端

工作：
- 在 service 内统一写 mapper，把 Prisma 数据转为静态页面已使用字段。
- 作者名统一：`nickname || account`。
- 头像统一：`avatarUrl || '/static/images/jeremy.webp'`。
- 封面统一：媒体第一张图，否则默认 `'/static/images/art_frommoon.jpg'`。

### Task 4: 前端接入接口

文件：
- 修改：`app/src/api/http.js` 或 `app/src/api/community.js`
- 修改：`app/src/pages/index/index.vue`
- 修改：`app/src/pages/community/index.vue`
- 修改：`app/src/pages/community/create.vue`
- 修改：`app/src/pages/community/detail.vue`
- 可选修改：`app/src/components/PostWaterfallCard.vue`

工作：
- 列表页从 `getCommunityFeed({ tab, keyword })` 获取数据。
- 首页从同一接口获取最新/推荐帖子。
- 发布页调用 `createCommunityPost`，成功后跳转详情或社区页。
- 详情页调用 `getCommunityPostDetail` 和 `getCommunityPostComments`。
- 点赞调用 `likeCommunityPost`。
- 评论调用 `createCommunityComment` 后刷新评论。
- `PostWaterfallCard` 目前头像写死，可改成 `post.avatar || 默认头像`。

---

## 6. 风险和待确认点

1. **编码显示问题：** 当前多个 Vue 文件中文在 PowerShell 输出里显示为乱码，但不影响字段识别。改代码前建议确认 IDE 中是否正常显示中文，避免保存时引入错误编码。
2. **请求封装重复：** `request.js` 与 `http.js` 并存。社区接口需要 token 时，必须统一处理，否则发帖/点赞/评论会 401。
3. **媒体上传：** 静态页面有媒体上传入口，但没有真实上传实现。第一版可以先支持传 URL/静态资源路径，真实上传单独做。
4. **“社区”命名口径：** 社区页只是帖子页，不做真实社区。代码里可以沿用现有 `community` 路由/API 命名以减少改动，但后端设计不要引入关注关系、圈子、社区成员、社区权限等概念。
5. **推荐排序：** 第一版建议 `recommend` 按 `createdAt desc`，`latest` 也按时间，`hot` 按 `likeCount desc/commentCount desc`。不做个性化推荐。
6. **评论点赞：** 静态页展示评论 likes，但前端 API 只预留帖子点赞，没有评论点赞接口。第一版可以只读评论点赞数，不实现评论点赞。
7. **权限策略：** `visibility: followers` 来自静态发布页，但当前业务不做关注关系。第一版建议前端先保留 UI，后端只保存字段；帖子流只展示 `public + syncToCommunity + published`，不实现 followers 权限。

---

## 7. 建议第一版交付边界

第一版完成：
- 新建帖子表、媒体表、标签表、点赞表、评论表。
- 登录用户可以发帖、点赞/取消点赞、发表评论。
- 首页和社区页展示数据库中的帖子流。
- 社区详情页展示真实详情和评论。
- 搜索、tab 过滤可用。

第一版暂不做：
- 真实媒体文件上传。
- 关注关系、圈子、真实社区成员体系与 followers 可见权限。
- 评论点赞接口。
- 收藏接口。
- 分享计数递增接口。
- 管理端审核。

---

## 8. 验证建议

后端：
- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run build`
- 手动请求：
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /community/posts`
  - `GET /community/posts`
  - `GET /community/posts/:id`
  - `POST /community/posts/:id/like`
  - `POST /community/posts/:id/comments`

前端：
- 登录后发布帖子。
- 回到首页和社区页能看到新帖子。
- 点击帖子进入详情，标题、正文、图集、标签、作者、计数正确。
- 点赞状态和数量能刷新。
- 发表评论后评论列表和评论数能刷新。
