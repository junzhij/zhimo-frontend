import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authAPI = {
  // 用户登录
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', {
      identifier: data.identifier,
      password: data.password,
    });
    return response.data;
  },

  // 用户注册
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  // 验证token
  verifyToken: async (): Promise<{ success: boolean; user?: any }> => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },

  // 登出
  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;