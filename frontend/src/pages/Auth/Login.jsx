import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../utils/api.js';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await post('/auth/login', values);
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('userInfo', JSON.stringify(res.user));
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error(res?.message || '登录失败');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: 'none'
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <UserOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 8 }}>欢迎回来</Title>
          <Text type="secondary">登录您的园艺助手账号</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请输入邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能少于6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{ height: 48, borderRadius: 8, fontWeight: 600 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            还没有账号？<Link to="/register" style={{ color: '#52c41a', fontWeight: 500 }}>去注册</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
