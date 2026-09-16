# 请假审批系统前端（React）

配套后端 DDD 练习项目，接口定义见 `../docs/设计文档.md`，数据库设计见 `../docs/schema.sql`。

## 技术栈

React 18 + Vite 5 + Ant Design 5 + React Router 6，请求层使用原生 fetch。

**前端不含任何模拟数据**：所有页面的数据均通过真实接口与后端交互。
后端未实现对应接口前，页面会停留在报错/空状态，由后端实现后自然呈现。

## 启动

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

开发模式下 Vite 已将 `/api` 代理到 `http://localhost:8080`，
请先启动 Spring Boot 后端再访问页面。

## 目录结构

```
src/
  api/request.js    # fetch 封装：统一 {code,message,data} 解包、Bearer token 认证头、401 跳登录
  api/leave.js      # 全部业务接口（认证/部门/请假单/审批/档案）
  context/          # 当前用户上下文（localStorage 持久化，退出时清理 token）
  components/       # 通用组件（状态标签）
  pages/            # Login（注册/登录）/ MyRequests / RequestEdit / RequestDetail / Approvals / Balances / Profile
```

## 页面 ↔ 接口对照

每个环节都依赖后端接口实现（登录注册与权限控制同样由后端完成）：

| 页面 | 路由 | 依赖接口 |
|------|------|----------|
| 登录/注册 | `/login` | POST /auth/register、POST /auth/login、GET /departments（注册部门下拉） |
| 我的请假单 | `/requests` | GET /leave-requests、submit/withdraw/cancel/close |
| 新建/编辑 | `/requests/new`、`/requests/:code/edit` | GET /leave-balances、POST/PUT /leave-requests、submit |
| 请假单详情 | `/requests/:code` | GET /leave-requests/{code}、生命周期接口、approve |
| 审批中心 | `/approvals`（主管） | GET /leave-requests/pending-approvals、approve |
| 假期余额 | `/balances` | GET /leave-balances |
| 个人信息 | `/profile` | PUT /employees/me（改名）；主管：POST /departments、PUT /employees/{code}/department、GET /employees |

权限说明：注册角色固定为员工（STAFF），主管（MANAGER）账号由后端种子数据提供；
菜单按角色显示，接口权限（谁能审批、谁看待办、谁能新增部门/调岗）全部由后端校验。
