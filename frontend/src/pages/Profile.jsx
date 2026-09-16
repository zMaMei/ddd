import { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Col, Descriptions, Form, Input, Row, Select, Space, message,
} from 'antd';
import {
  addDepartment, listDepartments, listEmployees, transferDepartment, updateMyName,
} from '../api/leave';
import { ROLE_NAMES } from '../constants';
import { useUser } from '../context/UserContext';

export default function Profile() {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <MyProfileCard />
      </Col>
      <Col span={12}>
        <ManagerToolsCard />
      </Col>
    </Row>
  );
}

/** 修改我的姓名（PUT /employees/me，规则与注册共用 → 后端 Name 值对象） */
function MyProfileCard() {
  const { user, login } = useUser();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const updated = await updateMyName({ name: values.name });
      login(updated); // 用后端返回刷新本地缓存的用户信息
      message.success('姓名已更新');
    } catch (e) {
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="个人信息">
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="工号">{user.code}</Descriptions.Item>
        <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
        <Descriptions.Item label="部门">{user.departmentName}</Descriptions.Item>
        <Descriptions.Item label="角色">{ROLE_NAMES[user.role]}</Descriptions.Item>
      </Descriptions>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ name: user.name }}>
        <Form.Item
          name="name"
          label="姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            { min: 2, max: 32, message: '姓名为 2~32 字' },
          ]}
        >
          <Input placeholder="2~32 字" maxLength={32} style={{ width: 240 }} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          保存
        </Button>
      </Form>
    </Card>
  );
}

/** 主管工具：新增部门、员工调岗（后端做 MANAGER 角色校验） */
function ManagerToolsCard() {
  const { user } = useUser();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deptForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  const load = useCallback(() => {
    listDepartments().then(setDepartments).catch(() => {});
    listEmployees()
      .then((list) => setEmployees(list.filter((e) => e.role === 'STAFF')))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user.role === 'MANAGER') {
      load();
    }
  }, [user.role, load]);

  if (user.role !== 'MANAGER') {
    return null; // 菜单已按角色控制，这里再兜底隐藏
  }

  const submitDepartment = async (values) => {
    try {
      await addDepartment({ name: values.name });
      message.success('部门已创建');
      deptForm.resetFields();
      load();
    } catch (e) {
      message.error(e.message);
    }
  };

  const submitTransfer = async (values) => {
    try {
      await transferDepartment(values.employeeCode, { departmentCode: values.departmentCode });
      message.success('调岗成功');
      transferForm.resetFields();
      load();
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <Card title="组织管理（主管）">
      <Form form={deptForm} layout="inline" onFinish={submitDepartment} style={{ marginBottom: 24 }}>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: '请输入部门名' },
            { min: 2, max: 32, message: '部门名为 2~32 字' },
          ]}
        >
          <Input placeholder="新部门名称" maxLength={32} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            新增部门
          </Button>
        </Form.Item>
      </Form>

      <Form form={transferForm} layout="inline" onFinish={submitTransfer}>
        <Form.Item name="employeeCode" rules={[{ required: true, message: '选择员工' }]}>
          <Select
            placeholder="选择员工"
            style={{ width: 160 }}
            showSearch
            optionFilterProp="label"
            options={employees.map((e) => ({
              value: e.code,
              label: `${e.name}（${e.departmentName}）`,
            }))}
          />
        </Form.Item>
        <Form.Item name="departmentCode" rules={[{ required: true, message: '选择目标部门' }]}>
          <Select
            placeholder="调至部门"
            style={{ width: 140 }}
            options={departments.map((d) => ({ value: d.code, label: d.name }))}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            调岗
          </Button>
        </Form.Item>
      </Form>
      <Space direction="vertical" size={0}>
        <span style={{ color: '#999', fontSize: 12 }}>
          调岗仅针对员工（STAFF）账号；权限由后端校验。
        </span>
      </Space>
    </Card>
  );
}
