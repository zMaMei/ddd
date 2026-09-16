import { Card, Form, Input, Button, Tabs, Typography, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authLogin, authRegister, listDepartments } from '../api/leave';
import { saveToken } from '../api/request';
import { useUser } from '../context/UserContext';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{4,32}$/;

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await authLogin({ username: values.username, password: values.password });
      saveToken(data.token);
      login(data.user);
      message.success(`欢迎回来，${data.user.name}`);
      navigate('/requests', { replace: true });
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input placeholder="用户名" autoComplete="username" />
      </Form.Item>
      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password placeholder="密码" autoComplete="current-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        登录
      </Button>
    </Form>
  );
}

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    listDepartments()
      .then(setDepartments)
      .catch((e) => message.error(`部门列表加载失败：${e.message}`));
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await authRegister({
        username: values.username,
        password: values.password,
        name: values.name,
        departmentCode: values.departmentCode,
      });
      saveToken(data.token);
      login(data.user);
      message.success('注册成功，已自动登录');
      navigate('/requests', { replace: true });
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名' },
          { pattern: USERNAME_PATTERN, message: '4~32 位，仅限字母/数字/下划线' },
        ]}
      >
        <Input placeholder="4~32 位字母/数字/下划线" autoComplete="off" />
      </Form.Item>
      <Form.Item
        name="name"
        label="姓名"
        rules={[
          { required: true, message: '请输入姓名' },
          { min: 2, max: 32, message: '姓名为 2~32 字' },
        ]}
      >
        <Input placeholder="真实姓名" />
      </Form.Item>
      <Form.Item
        name="departmentCode"
        label="所属部门"
        rules={[{ required: true, message: '请选择所属部门' }]}
      >
        <Select placeholder="从部门列表中选择" options={departments.map((d) => ({ value: d.code, label: d.name }))} />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, max: 32, message: '密码为 6~32 位' },
        ]}
      >
        <Input.Password placeholder="6~32 位" autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="confirm"
        label="确认密码"
        dependencies={['password']}
        rules={[
          { required: true, message: '请再次输入密码' },
          ({ getFieldValue }) => ({
            validator: (_, value) =>
              value === getFieldValue('password')
                ? Promise.resolve()
                : Promise.reject(new Error('两次输入的密码不一致')),
          }),
        ]}
      >
        <Input.Password placeholder="再次输入密码" autoComplete="new-password" />
      </Form.Item>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        注册后角色为员工（STAFF）；主管账号由系统初始化数据提供。
      </Typography.Paragraph>
      <Button type="primary" htmlType="submit" block loading={loading}>
        注册并登录
      </Button>
    </Form>
  );
}

export default function Login() {
  const { user } = useUser();
  if (user) {
    // 已登录直接进入系统（真实凭证是否有效由后端接口校验）
    return <Navigate to="/requests" replace />;
  }
  return (
    <div className="login-page">
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ textAlign: 'center', marginTop: 0 }}>
          请假审批系统
        </Typography.Title>
        <Tabs
          centered
          items={[
            { key: 'login', label: '登录', children: <LoginForm /> },
            { key: 'register', label: '注册', children: <RegisterForm /> },
          ]}
        />
      </Card>
    </div>
  );
}
