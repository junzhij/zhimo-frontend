import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Form, Card, Typography, Alert, Space, Progress } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { validateRegisterForm, hasFormErrors, validationRules } from '../utils/validation';
import type { FormErrors } from '../types/auth';

const { Title, Text } = Typography;

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 如果已经登录，重定向到主页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 清除错误信息
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // 计算密码强度
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  // 获取密码强度颜色
  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 30) return '#ff4d4f';
    if (strength < 60) return '#faad14';
    if (strength < 80) return '#1890ff';
    return '#52c41a';
  };

  // 获取密码强度文本
  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 30) return '弱';
    if (strength < 60) return '中等';
    if (strength < 80) return '强';
    return '很强';
  };

  // 处理输入变化
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 计算密码强度
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // 清除对应字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    // 前端验证
    const errors = validateRegisterForm(
      formData.username,
      formData.email,
      formData.password,
      formData.confirmPassword
    );
    
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    // 清除之前的错误
    setFormErrors({});
    clearError();

    // 提交注册请求
    const success = await register(formData.username, formData.email, formData.password);
    
    if (success) {
      // 注册成功后自动登录，跳转到主页
      navigate('/', { replace: true });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            智墨学习平台
          </Title>
          <Text type="secondary">创建您的账户</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="用户名"
            validateStatus={formErrors.username ? 'error' : ''}
            help={formErrors.username}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="请输入用户名（至少2个字符）"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="邮箱"
            validateStatus={formErrors.email ? 'error' : ''}
            help={formErrors.email}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="请输入邮箱地址"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            validateStatus={formErrors.password ? 'error' : ''}
            help={formErrors.password}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="请输入密码（至少8位，包含字母数字特殊字符）"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
            {formData.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>密码强度</Text>
                  <Text 
                    style={{ 
                      fontSize: 12, 
                      color: getPasswordStrengthColor(passwordStrength),
                      fontWeight: 500
                    }}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </Text>
                </div>
                <Progress
                  percent={passwordStrength}
                  showInfo={false}
                  strokeColor={getPasswordStrengthColor(passwordStrength)}
                  size="small"
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="确认密码"
            validateStatus={formErrors.confirmPassword ? 'error' : ''}
            help={formErrors.confirmPassword}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onPressEnter={handleSubmit}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              block
              loading={isLoading}
              onClick={handleSubmit}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 500
              }}
            >
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Text type="secondary">已有账户？</Text>
              <Link to="/login" style={{ color: '#1890ff', fontWeight: 500 }}>
                立即登录
              </Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;