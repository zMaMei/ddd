import { createContext, useContext, useState } from 'react';
import { clearAuth, loadCurrentUser, saveCurrentUser } from '../api/request';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadCurrentUser);

  const login = (employee) => {
    saveCurrentUser(employee);
    setUser(employee);
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
