import { request } from './request';

// ---------- 员工 / 余额 ----------
export const getMe = () => request('GET', '/api/v1/employees/me');

export const listEmployees = () => request('GET', '/api/v1/employees');

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
