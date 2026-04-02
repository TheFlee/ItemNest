import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";
import type { CurrentUser } from "../types/user";
import {
  googleLogin as googleLoginRequest,
  login as loginRequest,
  register as registerRequest,
} from "../api/authApi";
import { getCurrentUser } from "../api/userApi";
import { getToken, removeToken, setToken } from "../utils/token";

interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateAuth: (response: AuthResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function handleAuthSuccess(response: AuthResponse): void {
  setToken(response.token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser(): Promise<void> {
    const existingToken = getToken();

    if (!existingToken) {
      setUser(null);
      setTokenState(null);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setTokenState(existingToken);
    } catch {
      removeToken();
      setUser(null);
      setTokenState(null);
    }
  }

  async function updateAuth(response: AuthResponse): Promise<void> {
    handleAuthSuccess(response);
    setTokenState(response.token);

    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function login(request: LoginRequest): Promise<void> {
    const response = await loginRequest(request);
    await updateAuth(response);
  }

  async function register(request: RegisterRequest): Promise<void> {
    const response = await registerRequest(request);
    await updateAuth(response);
  }

  async function googleLogin(idToken: string): Promise<void> {
    const response = await googleLoginRequest({ idToken });
    await updateAuth(response);
  }

  function logout(): void {
    removeToken();
    setUser(null);
    setTokenState(null);
  }

  useEffect(() => {
    async function initializeAuth() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }

    void initializeAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      googleLogin,
      logout,
      refreshUser,
      updateAuth,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}