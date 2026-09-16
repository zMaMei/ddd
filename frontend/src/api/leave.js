import { request } from './request';

// ---------- 认证（登录注册与权限控制由后端实现） ----------
export const authRegister = (body) =>
  request('POST', '/api/v1/auth/register', { body });

export const authLogin = (body) =>
  request('POST', '/api/v1/auth/login', { body });

export const authLogout = () => request('POST', '/api/v1/auth/logout');

export const getMe = () => request('GET', '/api/v1/auth/me');

// ---------- 部门（employee 域） ----------
export const listDepartments = () => request('GET', '/api/v1/departments');

export const addDepartment = (body) =>
  request('POST', '/api/v1/departments', { body });

export const listEmployees = () => request('GET', '/api/v1/employees');

export const updateMyName = (body) =>
  request('PUT', '/api/v1/employees/me', { body });

export const transferDepartment = (code, body) =>
  request('PUT', `/api/v1/employees/${code}/department`, { body });

// ---------- 余额 ----------
export const listBalances = (year) =>
  request('GET', '/api/v1/leave-balances', { params: { year } });

// ---------- 请假单查询 ----------
export const listMyRequests = (params) =>
  request('GET', '/api/v1/leave-requests', { params });

export const listPendingApprovals = (params) =>
  request('GET', '/api/v1/leave-requests/pending-approvals', { params });

export const getRequestDetail = (code) =>
  request('GET', `/api/v1/leave-requests/${code}`);

// ---------- 请假单生命周期 ----------
export const createRequest = (body) =>
  request('POST', '/api/v1/leave-requests', { body });

export const updateRequest = (code, body) =>
  request('PUT', `/api/v1/leave-requests/${code}`, { body });

export const submitRequest = (code) =>
  request('POST', `/api/v1/leave-requests/${code}/submit`);

export const withdrawRequest = (code) =>
  request('POST', `/api/v1/leave-requests/${code}/withdraw`);

export const cancelRequest = (code) =>
  request('POST', `/api/v1/leave-requests/${code}/cancel`);

export const closeRequest = (code) =>
  request('POST', `/api/v1/leave-requests/${code}/close`);

export const approveRequest = (code, body) =>
  request('POST', `/api/v1/leave-requests/${code}/approve`, { body });
