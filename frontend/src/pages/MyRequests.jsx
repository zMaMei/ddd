import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Space, Table, message, Modal, Tooltip } from 'antd';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { listMyRequests, submitRequest, withdrawRequest, cancelRequest, closeRequest } from '../api/leave';
import { LEAVE_TYPE_NAMES, STATUS_NAMES } from '../constants';
import StatusTag from '../components/StatusTag';

const { Option } = Select;

export default function MyRequests() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ list: [], total: 0, page: 1, size: 10 });
  const [query, setQuery] = useState({ page: 1, size: 10 });

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      setData(await listMyRequests(params));
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(query);
  }, [query, load]);

  const onFinish = (values) => {
    setQuery({ ...values, page: 1, size: 10 });
  };

  const runAction = async (action, code, tip) => {
    Modal.confirm({
      title: tip,
      onOk: async () => {
        try {
          await action(code);
          message.success('操作成功');
          load(query);
        } catch (e) {
          message.error(e.message);
        }
      },
    });
  };

  const columns = [
    { title: '单号', dataIndex: 'code', width: 170 },
    {
      title: '假期类型',
      dataIndex: 'leaveType',
      width: 90,
      render: (v) => LEAVE_TYPE_NAMES[v] || v,
    },
    {
      title: '请假时间',
      width: 210,
      render: (_, r) => `${r.startDate} ~ ${r.endDate}`,
    },
    { title: '时长(天)', dataIndex: 'duration', width: 80, align: 'center' },
    { title: '事由', dataIndex: 'reason', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => <StatusTag status={v} /> },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 150,
      render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 230,
      render: (_, r) => (
        <Space size={0} wrap>
          {r.status === 'DRAFT' && (
            <>
              <Button type="link" size="small" onClick={() => runAction(submitRequest, r.code, `确认提交请假单 ${r.code}？`)}>
                提交
              </Button>
              <Button type="link" size="small" onClick={() => navigate(`/requests/${r.code}/edit`)}>
                编辑
              </Button>
            </>
          )}
          {r.status === 'SUBMITTED' && (
            <Button type="link" size="small" onClick={() => runAction(withdrawRequest, r.code, `撤回后单据回到草稿，确认撤回 ${r.code}？`)}>
              撤回
            </Button>
          )}
          {r.status === 'APPROVED' && (
            <>
              <Tooltip title="开始日前可取消，取消后回滚余额">
                <Button type="link" size="small" danger onClick={() => runAction(cancelRequest, r.code, `确认取消请假单 ${r.code}？`)}>
                  取消
                </Button>
              </Tooltip>
              <Tooltip title="假期结束后确认完结">
                <Button type="link" size="small" onClick={() => runAction(closeRequest, r.code, `确认对请假单 ${r.code} 销假？`)}>
                  销假
                </Button>
              </Tooltip>
            </>
          )}
          <Button type="link" size="small" onClick={() => navigate(`/requests/${r.code}`)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 16, rowGap: 8 }}>
        <Form.Item name="keyword">
          <Input placeholder="单号 / 事由" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="状态" allowClear style={{ width: 130 }}>
            {Object.entries(STATUS_NAMES).map(([k, v]) => (
              <Option key={k} value={k}>
                {v}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="leaveType">
          <Select placeholder="假期类型" allowClear style={{ width: 120 }}>
            {Object.entries(LEAVE_TYPE_NAMES).map(([k, v]) => (
              <Option key={k} value={k}>
                {v}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button icon={<RedoOutlined />} onClick={() => form.resetFields()} />
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/requests/new')}>
          新建请假单
        </Button>
      </div>

      <Table
        rowKey="code"
        loading={loading}
        columns={columns}
        dataSource={data.list}
        pagination={{
          current: data.page,
          pageSize: data.size,
          total: data.total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => setQuery((q) => ({ ...q, page, size })),
        }}
      />
    </div>
  );
}
