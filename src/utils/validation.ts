import type { FormErrors, ValidationRule } from '../types/auth';

// 邮箱格式验证正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码强度验证正则（至少8位，包含字母数字特殊字符）
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// 验证规则定义
export const validationRules = {
  email: {
    required: true,
    pattern: EMAIL_REGEX,
    message: '请输入有效的邮箱地址',
  } as ValidationRule,
  
  password: {
    required: true,
    pattern: PASSWORD_REGEX,
    minLength: 8,
    message: '密码至少8位，包含字母、数字和特殊字符',
  } as ValidationRule,
  
  username: {
    required: true,
    minLength: 2,
    message: '用户名至少2个字符',
  } as ValidationRule,
  
  confirmPassword: {
    required: true,
    message: '请确认密码',
  } as ValidationRule,
};

// 验证单个字段
export const validateField = (value: string, rule: ValidationRule, compareValue?: string): string => {
  if (rule.required && (!value || value.trim() === '')) {
    return rule.message;
  }
  
  if (value && rule.minLength && value.length < rule.minLength) {
    return rule.message;
  }
  
  if (value && rule.pattern && !rule.pattern.test(value)) {
    return rule.message;
  }
  
  // 确认密码验证
  if (compareValue !== undefined && value !== compareValue) {
    return '两次输入的密码不一致';
  }
  
  return '';
};

// 验证登录表单
export const validateLoginForm = (data: {
  identifier: string;
  password: string;
}): FormErrors => {
  const errors: FormErrors = {};

  // 验证标识符（邮箱或用户名）
  if (!data.identifier) {
    errors.identifier = '请输入邮箱或用户名';
  } else if (data.identifier.length < 3) {
    errors.identifier = '邮箱或用户名至少3个字符';
  }

  // 验证密码
  if (!data.password) {
    errors.password = '请输入密码';
  }

  return errors;
};

// 验证注册表单
export const validateRegisterForm = (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): FormErrors => {
  const errors: FormErrors = {};
  
  const usernameError = validateField(username, validationRules.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateField(email, validationRules.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validateField(password, validationRules.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateField(confirmPassword, validationRules.confirmPassword, password);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return errors;
};

// 检查表单是否有错误
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// 清除表单错误
export const clearFormErrors = (): FormErrors => {
  return {};
};