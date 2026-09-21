import { createContext, useContext, useState } from 'react';
import { clearAuth, loadCurrentUser, saveCurrentUser } from '../api/request';

/**
 * 适配后端返回的用户结构，统一成前端内部形状：
 * - 后端当前返回 employeeCode，设计文档定义为 code → 两者兼容
 * - name / departmentName 后端暂未返回 → 先用兜底值占位，后端补字段后自动生效
 */
function normalizeUser(user) {
  if (!user) return null;
  return {
    code: user.code ?? user.employeeCode,
    username: user.username,
    name: user.name ?? user.username,
    departmentName: user.departmentName ?? '未分配',
    role: user.role,
  };
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(loadCurrentUser()));

  const login = (employee) => {
    const normalized = normalizeUser(employee);
    saveCurrentUser(normalized);
    setUser(normalized);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
