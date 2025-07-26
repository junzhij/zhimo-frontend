import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth';
import { authAPI } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 登录
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ identifier, password });
          if (response.success) {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }
          return false;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '登录失败，请重试';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // 注册
      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register({ username, email, password, confirmPassword: password });
          if (response.success) {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }
          return false;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '注册失败，请重试';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // 登出
      logout: () => {
        authAPI.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 初始化认证状态
      initializeAuth: async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            // 验证token是否有效
            const verifyResult = await authAPI.verifyToken();
            if (verifyResult.success) {
              set({
                user,
                token,
                isAuthenticated: true,
              });
            } else {
              // Token无效，清除本地存储并设置未认证状态
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              });
            }
          } catch (error) {
            // 解析用户信息失败，清除本地存储并设置未认证状态
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        } else {
          // 没有token或用户信息，确保设置为未认证状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthStore) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);