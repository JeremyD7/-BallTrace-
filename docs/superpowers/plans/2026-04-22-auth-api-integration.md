# Auth API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the frontend login/register page with the NestJS auth endpoints through a centralized API layer.

**Architecture:** Add a small `api` directory under `app/src` with one shared HTTP wrapper and one auth-specific module. Update the login page to call those functions, surface backend validation/errors, and persist the returned auth payload for later app usage.

**Tech Stack:** uni-app, Vue 3 `<script setup>`, `uni.request`, NestJS auth API

---

### Task 1: Create centralized API modules

**Files:**
- Create: `app/src/api/http.js`
- Create: `app/src/api/auth.js`

- [ ] Add a Promise-based `uni.request` wrapper with base URL and normalized error messages.
- [ ] Add `login(payload)` and `register(payload)` functions that call `/auth/login` and `/auth/register`.

### Task 2: Connect login page to API modules

**Files:**
- Modify: `app/src/pages/login/index.vue`

- [ ] Replace placeholder login/register success behavior with real async API calls.
- [ ] Preserve existing mode switching and validation UX.
- [ ] Persist returned auth payload in local storage before entering the app.
- [ ] Surface backend error messages through `uni.showToast`.

### Task 3: Verify integration wiring

**Files:**
- Verify: `app/src/api/http.js`
- Verify: `app/src/api/auth.js`
- Verify: `app/src/pages/login/index.vue`

- [ ] Run a syntax check for the API modules.
- [ ] Run a Vue SFC compile check for the login page.
