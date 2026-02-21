import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { IUser, UserLevel } from "../@types/global";
import { getStorage, saveStorage, removeFromStorage } from "../utils/storage";
import config from "../config";
import { supabase } from "../config";

interface ISessionContext {
  isAuthenticated: boolean;
  user: IUser | null;
  login: (user: IUser, token: string) => void;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<IUser | null>;
}

export const SessionContext = createContext<ISessionContext | undefined>(
  undefined,
);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const storedUser = getStorage("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  const login = useCallback((userData: IUser, token: string) => {
    setUser(userData);
    saveStorage("user", JSON.stringify(userData));
    saveStorage(config.API.TOKEN_NAME, token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
    removeFromStorage("user");
    removeFromStorage(config.API.TOKEN_NAME);
  }, []);

  const getCurrentUser = useCallback(async (): Promise<IUser | null> => {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      if (supabaseUser) {
        return {
          name:
            supabaseUser.user_metadata?.name || supabaseUser.email || "User",
          email: supabaseUser.email || "",
          level: UserLevel.ADMIN, // Customize as needed
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }, []);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userData: IUser = {
          name:
            session.user.user_metadata?.name || session.user.email || "User",
          email: session.user.email || "",
          level: UserLevel.ADMIN, // Can be customized
        };
        login(userData, session.access_token);
      } else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return (
    <SessionContext.Provider
      value={{ isAuthenticated, user, login, logout, getCurrentUser }}
    >
      {children}
    </SessionContext.Provider>
  );
};
