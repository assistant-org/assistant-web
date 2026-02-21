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
    console.log(userData);
    setUser(userData);
    saveStorage("user", JSON.stringify(userData));
    saveStorage(config.API.TOKEN_NAME, token);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    removeFromStorage("user");
    removeFromStorage(config.API.TOKEN_NAME);
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // clearSession will be called by the onAuthStateChange listener
    } catch (error) {
      console.error("Error signing out:", error);
      // If signOut fails, still clear local session
      clearSession();
    }
  }, [clearSession]);

  const getCurrentUser = useCallback(async (): Promise<IUser | null> => {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      if (supabaseUser) {
        return {
          name:
            (supabaseUser as any).display?.name ||
            supabaseUser.user_metadata?.display?.name ||
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split("@")[0] ||
            "User",
          email: supabaseUser.email || "",
          level: UserLevel.ADMIN,
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
            (session.user as any).display?.name ||
            session.user.user_metadata?.display?.name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email || "",
          level: UserLevel.ADMIN,
        };
        login(userData, session.access_token);
      } else if (event === "SIGNED_OUT") {
        clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, clearSession]);

  return (
    <SessionContext.Provider
      value={{ isAuthenticated, user, login, logout, getCurrentUser }}
    >
      {children}
    </SessionContext.Provider>
  );
};
