const TOKEN_KEY = 'leave-oa-token';
const USER_KEY = 'leave-oa-current-user';

export function loadToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function loadCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuth() {
  saveToken(null);
  saveCurrentUser(null);
}

// 无需 token 的免认证接口（注册下拉需要部门列表，仅 GET 免认证）
function isPublicPath(method, path) {
  if (path === '/api/v1/auth/register' || path === '/api/v1/auth/login') {
    return true;
  }
  return method === 'GET' && path === '/api/v1/departments';
}

function redirectToLogin() {
  clearAuth();
  window.location.replace('/login');
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      search.set(k, v);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * 统一请求入口，所有数据均来自真实后端，前端不做任何模拟。
 * 认证：登录/注册接口由后端签发 token，此后所有请求携带
 * Authorization: Bearer {token}；收到 40100（未登录/凭证失效）时
 * 清除本地凭证并跳转登录页。
 * 后端响应包装为 { code, message, data }：code === 0 时返回 data，
 * 否则抛出带 message 的异常（页面层统一 message.error 提示）。
 */
export async function request(method, url, { params, body } = {}) {
  const headers = {};
  const path = url.split('?')[0];
  const token = loadToken();
  if (token && !isPublicPath(method, path)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  let resp;
  try {
    resp = await fetch(url + buildQuery(params), config);
  } catch {
    throw new Error('网络异常，请确认后端服务已启动');
  }

  if (!resp.ok) {
    if (resp.status === 401) {
      redirectToLogin();
    }
    throw new Error(`请求失败：HTTP ${resp.status}`);
  }

  const wrapper = await resp.json();
  if (wrapper.code !== 0) {
    if (wrapper.code === 40100 && !isPublicPath(method, path)) {
      redirectToLogin();
    }
    const err = new Error(wrapper.message || '操作失败');
    err.code = wrapper.code;
    throw err;
  }
  return wrapper.data;
}
