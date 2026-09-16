import { createContext, useContext, useState } from 'react';
import { loadCurrentUser, saveCurrentUser } from '../api/request';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadCurrentUser);

  const login = (employee) => {
    saveCurrentUser(employee);
    setUser(employee);
  };

  const logout = () => {
    saveCurrentUser(null);
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
