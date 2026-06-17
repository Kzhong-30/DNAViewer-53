import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../utils/api.js';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await post('/auth/register', values);
      if (res) {
        message.success('注册成功，请登录');
        navigate('/login');
      } else {
        message.error(res?.message || '注册失败');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <Card
        style={{
          width: 440,
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
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <SafetyOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 8 }}>创建账号</Title>
          <Text type="secondary">注册您的园艺助手账号</Text>
        </div>

        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

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

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请再次输入密码"
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            已有账号？<Link to="/login" style={{ color: '#1890ff', fontWeight: 500 }}>去登录</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
