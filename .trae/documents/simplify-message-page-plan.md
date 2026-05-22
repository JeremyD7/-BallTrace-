# 消息界面功能精简计划

## 问题分析
当前消息界面有 3 个功能卡片 + 私信功能：
1. 探索消息（保留）
2. 球局通知（保留）
3. 系统消息（去掉）
4. 私信（去掉）

## 需要修改的文件
1. `app/src/pages/message/index.vue` - 移除系统消息和私信功能

## 修复步骤

### 1. 修改数据结构
- 从 `categoryCards` 数组中移除 `system` 项
- 移除 `directMessages` 数组
- 从 `panelMessages` 中移除 `system` 项
- 从 `panelMeta` 中移除 `system` 项
- 更新 `message-subtitle` 文案

### 2. 修改模板
- 移除私信部分的代码：`section-head` 和 `direct-list`
- 调整分类卡片布局（从 3 列改为 2 列）

### 3. 修改样式
- 更新 `.category-grid` 从 `grid-template-columns: repeat(3, minmax(0, 1fr))` 改为 `repeat(2, minmax(0, 1fr))`

## 预期结果
消息界面只保留：
1. 探索消息卡片
2. 球局通知卡片
不再显示系统消息和私信功能
