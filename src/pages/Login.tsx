import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox, Form, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { validateLoginForm, hasFormErrors } from '../utils/validation';
import type { FormErrors } from '../types/auth';

const { Title, Text } = Typography;

interface LoginFormData {
  identifier: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    remember: false,
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

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

  // 处理输入变化
  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    const errors = validateLoginForm({
      identifier: formData.identifier,
      password: formData.password,
    });
    
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    // 清除之前的错误
    setFormErrors({});
    clearError();

    // 提交登录请求
    const success = await login(formData.identifier, formData.password);
    
    if (success) {
      // 如果选择了记住我，保存标识符到localStorage
      if (formData.remember) {
        localStorage.setItem('rememberedIdentifier', formData.identifier);
      } else {
        localStorage.removeItem('rememberedIdentifier');
      }
      
      navigate('/', { replace: true });
    }
  };

  // 组件挂载时检查是否有记住的标识符
  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem('rememberedIdentifier');
    if (rememberedIdentifier) {
      setFormData(prev => ({ ...prev, identifier: rememberedIdentifier, remember: true }));
    }
  }, []);

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
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            智墨学习平台
          </Title>
          <Text type="secondary">登录您的账户</Text>
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
            label="邮箱/用户名"
            validateStatus={formErrors.identifier ? 'error' : ''}
            help={formErrors.identifier}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="请输入邮箱或用户名"
              value={formData.identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              onPressEnter={handleSubmit}
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
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onPressEnter={handleSubmit}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                checked={formData.remember}
                onChange={(e) => handleInputChange('remember', e.target.checked)}
              >
                记住我
              </Checkbox>
              <Link to="/forgot-password" style={{ color: '#1890ff' }}>
                忘记密码？
              </Link>
            </div>
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
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Text type="secondary">还没有账户？</Text>
              <Link to="/register" style={{ color: '#1890ff', fontWeight: 500 }}>
                立即注册
              </Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;