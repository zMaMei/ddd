import { mockRequest } from '../mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const USER_KEY = 'leave-oa-current-user';

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
 * 统一请求入口。后端响应包装为 { code, message, data }：
 * code === 0 时返回 data，否则抛出带 message 的异常（页面层统一 message.error 提示）。
 * 模拟登录：所有请求携带 X-Employee-Code 请求头。
 */
export async function request(method, url, { params, body } = {}) {
  const headers = {};
  const user = loadCurrentUser();
  if (user?.code) {
    headers['X-Employee-Code'] = user.code;
  }

  if (USE_MOCK) {
    return mockRequest(method, url, { params, body, headers });
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
    throw new Error(`请求失败：HTTP ${resp.status}`);
  }

  const wrapper = await resp.json();
  if (wrapper.code !== 0) {
    const err = new Error(wrapper.message || '操作失败');
    err.code = wrapper.code;
    throw err;
  }
  return wrapper.data;
}
