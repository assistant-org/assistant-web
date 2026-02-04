
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { IUser, UserLevel } from '../@types/global';
import { getStorage, saveStorage, removeFromStorage } from '../utils/storage';
import config from '../config';

interface ISessionContext {
  isAuthenticated: boolean;
  user: IUser | null;
  login: (user: IUser, token: string) => void;
  logout: () => void;
}

export const SessionContext = createContext<ISessionContext | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const storedUser = getStorage('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  const login = useCallback((userData: IUser, token: string) => {
    setUser(userData);
    saveStorage('user', JSON.stringify(userData));
    saveStorage(config.API.TOKEN_NAME, token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeFromStorage('user');
    removeFromStorage(config.API.TOKEN_NAME);
  }, []);

  return (
    <SessionContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
