// 用户认证相关类型定义

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    displayName: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthError {
  success: false;
  message: string;
  error?: string;
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}