# 个人中心帖子显示问题修复计划

## 问题分析

用户反馈：自己发布的帖子在个人中心笔记栏看不到，还是显示默认数据

### 当前问题诊断

1. **前端个人中心页面** ([app/src/pages/profile/index.vue])：
   - 当接口调用失败时，显示 toast 提示"个人资料接口待接入"
   - 没有处理本地默认数据的逻辑
   - 使用 `authStore.profile.posts` 数据

2. **后端 Profile 接口** ([service/src/profile/profile.service.ts])：
   - 已修改为从 CommunityPost 表获取真实数据
   - 但可能后端服务没有重启生效

3. **关键点**：
   - 需要确保后端服务使用最新代码
   - 需要确保前端能正确显示接口数据

## 修复方案

### 1. 验证并完善后端服务

#### 修改内容

**文件**: [service/src/profile/profile.service.ts]

- 确保使用最新的已修改的代码
- 添加调试日志（可选）
- 验证数据库查询逻辑

### 2. 修改前端个人中心页面

#### 修改内容

**文件**: [app/src/pages/profile/index.vue]

- 移除错误处理中的默认提示，改为更友好的错误处理
- 确保即使接口失败也不显示假数据
- 优化加载状态和错误状态显示

### 3. 添加用户帖子获取的 API 接口（优化方案）

在社区模块添加专门的"获取我的帖子"接口

#### 修改内容

**文件**: [service/src/community/community.controller.ts]
**文件**: [service/src/community/community.service.ts]

- 添加 `GET /community/posts/my` 接口
- 返回用户自己发布的帖子

**文件**: [app/src/api/community.js]

- 添加对应的 API 调用函数

## 详细步骤

### 步骤 1：确认后端代码正确

验证 [service/src/profile/profile.service.ts] 的代码是最新的。

### 步骤 2：修改前端 Profile 页面

优化 [app/src/pages/profile/index.vue] 的错误处理和数据显示逻辑。

### 步骤 3：添加优化的接口（可选但推荐）

在社区模块添加专门的"我的帖子"接口，让前端可以独立调用。

## 预期结果

- 个人中心笔记栏显示用户真实发布的帖子
- 如果没有帖子，显示空状态而不是假数据
- 接口失败时显示友好提示

---

**计划状态**: 待审批
