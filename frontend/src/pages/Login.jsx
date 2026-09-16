import { Card, Avatar, List, Typography, Spin, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listEmployees } from '../api/leave';
import { ROLE_NAMES } from '../constants';
import { useUser } from '../context/UserContext';

export default function Login() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, login } = useUser();

  useEffect(() => {
    if (user) {
      navigate('/requests', { replace: true });
      return;
    }
    listEmployees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  return (
    <div className="login-page">
      <Card title="请假审批系统 — 选择身份登录（模拟）" style={{ width: 520 }}>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Typography.Paragraph type="secondary">
          练习项目不做真实登录，请选择一个员工身份进入系统（主管可审批）。
        </Typography.Paragraph>
        <Spin spinning={loading}>
          <List
            dataSource={employees}
            renderItem={(item) => (
              <List.Item
                className="login-item"
                onClick={() => {
                  login(item);
                  navigate('/requests', { replace: true });
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar>{item.name[0]}</Avatar>}
                  title={
                    <span>
                      {item.name}
                      &nbsp;
                      <Typography.Text type="secondary">
                        {item.code} · {item.department}
                      </Typography.Text>
                    </span>
                  }
                  description={ROLE_NAMES[item.role]}
                />
              </List.Item>
            )}
          />
        </Spin>
      </Card>
    </div>
  );
}
