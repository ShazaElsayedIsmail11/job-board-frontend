import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { API_BASE_URL } from "../config/api";

type Role = "SEEKER" | "EMPLOYER";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type MeResponse = {
  data: User;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "job-board-token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_KEY))
  );

  function login(newToken: string) {
    localStorage.setItem(TOKEN_KEY, newToken);

    setToken(newToken);
    setUser(null);
    setLoading(true);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
    setLoading(false);
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Invalid session");
        }

        const result: MeResponse = await response.json();

        if (!controller.signal.aborted) {
          setUser(result.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          localStorage.removeItem(TOKEN_KEY);

          setToken(null);
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      controller.abort();
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}