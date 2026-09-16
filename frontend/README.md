# 请假审批系统前端（React）

配套后端 DDD 练习项目，接口定义见 `../docs/设计文档.md`，数据库设计见 `../docs/schema.sql`。

## 技术栈

React 18 + Vite 5 + Ant Design 5 + React Router 6，请求层使用原生 fetch。

## 启动

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Mock 模式（后端未完成时）

`.env.development` 中 `VITE_USE_MOCK=true` 时，前端使用内置 Mock（`src/mock/index.js`），
内存数据、状态机与业务规则均已实现，可独立跑通全部页面。

## 对接真实后端

1. `.env.development` 改为 `VITE_USE_MOCK=false`；
2. 启动 Spring Boot（8080 端口），Vite 已配置 `/api` 代理。

## 目录结构

```
src/
  api/request.js    # fetch 封装：统一 {code,message,data} 解包、X-Employee-Code 模拟登录头
  api/leave.js      # 全部业务接口
  mock/index.js     # 内置 Mock（内存数据 + 状态机规则）
  context/          # 当前用户上下文（localStorage 持久化）
  components/       # 通用组件（状态标签）
  pages/            # Login / MyRequests / RequestEdit / RequestDetail / Approvals / Balances
```

## 页面 ↔ 接口对照

| 页面 | 路由 | 接口 |
|------|------|------|
| 选择身份 | `/login` | GET /employees |
| 我的请假单 | `/requests` | GET /leave-requests、submit/withdraw/cancel/close |
| 新建/编辑 | `/requests/new`、`/requests/:code/edit` | GET /leave-balances、POST/PUT /leave-requests、submit |
| 请假单详情 | `/requests/:code` | GET /leave-requests/{code}、生命周期接口、approve |
| 审批中心 | `/approvals`（主管） | GET /leave-requests/pending-approvals、approve |
| 假期余额 | `/balances` | GET /leave-balances |
