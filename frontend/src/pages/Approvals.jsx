import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Radio, Space, Table, message } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { listPendingApprovals, approveRequest } from '../api/leave';
import { LEAVE_TYPE_NAMES } from '../constants';
import StatusTag from '../components/StatusTag';

export default function Approvals() {
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState({ page: 1, size: 10 });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ list: [], total: 0, page: 1, size: 10 });
  const [current, setCurrent] = useState(null);
  const [form] = Form.useForm();
  const [acting, setActing] = useState(false);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      setData(await listPendingApprovals(params));
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(query);
  }, [query, load]);

  const submitApproval = async () => {
    const values = await form.validateFields();
    setActing(true);
    try {
      await approveRequest(current.code, { ...values, version: current.version });
      message.success('审批完成');
      setCurrent(null);
      form.resetFields();
      load(query);
    } catch (e) {
      message.error(e.message);
    } finally {
      setActing(false);
    }
  };

  const columns = [
    { title: '单号', dataIndex: 'code', width: 170 },
    { title: '申请人', dataIndex: 'applicantName', width: 100 },
    { title: '部门', dataIndex: 'department', width: 120 },
    {
      title: '假期类型',
      dataIndex: 'leaveType',
      width: 90,
      render: (v) => LEAVE_TYPE_NAMES[v] || v,
    },
    { title: '请假时间', width: 200, render: (_, r) => `${r.startDate} ~ ${r.endDate}` },
    { title: '时长(天)', dataIndex: 'duration', width: 80, align: 'center' },
    { title: '事由', dataIndex: 'reason', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => <StatusTag status={v} /> },
    {
      title: '操作',
      width: 90,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => setCurrent(r)}>
          审批
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="单号 / 事由"
          allowClear
          style={{ width: 220 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => setQuery({ keyword, page: 1, size: 10 })}
        />
        <Button type="primary" onClick={() => setQuery({ keyword, page: 1, size: 10 })}>
          查询
        </Button>
        <Button
          icon={<RedoOutlined />}
          onClick={() => {
            setKeyword('');
            setQuery({ page: 1, size: 10 });
          }}
        />
      </Space>

      <Table
        rowKey="code"
        loading={loading}
        columns={columns}
        dataSource={data.list}
        pagination={{
          current: data.page,
          pageSize: data.size,
          total: data.total,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => setQuery((q) => ({ ...q, page, size })),
        }}
      />

      <Modal
        title={`审批 - ${current?.code || ''}`}
        open={Boolean(current)}
        onCancel={() => setCurrent(null)}
        onOk={submitApproval}
        confirmLoading={acting}
      >
        <Form form={form} layout="vertical" initialValues={{ action: 'APPROVE' }}>
          <Form.Item name="action" label="审批结论">
            <Radio.Group>
              <Radio value="APPROVE">通过（通过后扣减余额）</Radio>
              <Radio value="REJECT">驳回</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="comment"
            label="审批意见"
            rules={[
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  getFieldValue('action') === 'REJECT' && !(value || '').trim()
                    ? Promise.reject(new Error('驳回时必须填写审批意见'))
                    : Promise.resolve(),
              }),
              { max: 200, message: '审批意见不能超过 200 字' },
            ]}
          >
            <Input.TextArea rows={3} placeholder="选填；驳回时必填" showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
