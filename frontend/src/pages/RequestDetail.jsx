import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Card, Descriptions, Form, Input, Modal, Radio, Space, Spin, Steps, Timeline, message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getRequestDetail, submitRequest, withdrawRequest, cancelRequest, closeRequest, approveRequest } from '../api/leave';
import { APPROVAL_ACTION_NAMES } from '../constants';
import { useUser } from '../context/UserContext';
import StatusTag from '../components/StatusTag';

const STATUS_STEPS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'CLOSED'];

export default function RequestDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approveOpen, setApproveOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDetail(await getRequestDetail(code));
    } catch (e) {
      message.error(e.message);
      navigate('/requests', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [code, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (action, tip) => {
    Modal.confirm({
      title: tip,
      onOk: async () => {
        try {
          await action(code);
          message.success('操作成功');
          load();
        } catch (e) {
          message.error(e.message);
        }
      },
    });
  };

  const submitApproval = async () => {
    const values = await form.validateFields();
    setActing(true);
    try {
      await approveRequest(code, { ...values, version: detail.version });
      message.success('审批完成');
      setApproveOpen(false);
      form.resetFields();
      load();
    } catch (e) {
      message.error(e.message);
    } finally {
      setActing(false);
    }
  };

  if (loading || !detail) {
    return <Spin style={{ display: 'block', marginTop: 80 }} />;
  }

  const isOwner = detail.applicantCode === user.code;
  const isManager = user.role === 'MANAGER';
  const currentStep = STATUS_STEPS.indexOf(detail.status);
  const terminalRejected = ['REJECTED', 'CANCELLED'].includes(detail.status);

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/requests')} style={{ marginBottom: 12 }}>
        返回列表
      </Button>

      <Card
        title={
          <Space>
            <span>请假单 {detail.code}</span>
            <StatusTag status={detail.status} />
          </Space>
        }
        extra={
          <Space>
            {isOwner && detail.status === 'DRAFT' && (
              <>
                <Button onClick={() => navigate(`/requests/${code}/edit`)}>编辑</Button>
                <Button type="primary" onClick={() => runAction(submitRequest, '确认提交审批？')}>
                  提交
                </Button>
              </>
            )}
            {isOwner && detail.status === 'SUBMITTED' && (
              <Button onClick={() => runAction(withdrawRequest, '撤回后回到草稿，确认撤回？')}>撤回</Button>
            )}
            {isOwner && detail.status === 'APPROVED' && (
              <>
                <Button danger onClick={() => runAction(cancelRequest, '取消后回滚余额，确认取消？')}>
                  取消
                </Button>
                <Button onClick={() => runAction(closeRequest, '确认销假完结？')}>销假</Button>
              </>
            )}
            {isManager && detail.status === 'SUBMITTED' && !isOwner && (
              <Button type="primary" onClick={() => setApproveOpen(true)}>
                审批
              </Button>
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {!terminalRejected && (
          <Steps
            size="small"
            current={currentStep === -1 ? 0 : currentStep}
            status={terminalRejected ? 'error' : undefined}
            items={STATUS_STEPS.map((s) => ({ title: <StatusTag status={s} /> }))}
            style={{ marginBottom: 24 }}
          />
        )}
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="申请人">{detail.applicantName}（{detail.applicantCode}）</Descriptions.Item>
          <Descriptions.Item label="部门">{detail.department}</Descriptions.Item>
          <Descriptions.Item label="假期类型">{detail.leaveTypeName}</Descriptions.Item>
          <Descriptions.Item label="时长">{detail.duration} 天</Descriptions.Item>
          <Descriptions.Item label="开始日期">{detail.startDate}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{detail.endDate}</Descriptions.Item>
          <Descriptions.Item label="请假事由" span={2}>{detail.reason}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{detail.createdAt}</Descriptions.Item>
          <Descriptions.Item label="最近更新">{detail.updatedAt}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="审批记录" size="small">
        {detail.approvalRecords?.length ? (
          <Timeline
            items={detail.approvalRecords.map((r) => ({
              color: r.action === 'APPROVE' ? 'green' : 'red',
              children: (
                <div>
                  <b>{r.approverName}</b>（{r.approverCode}）
                  <StatusTagLike action={r.action} />
                  <div style={{ color: '#666' }}>{r.comment || '无审批意见'}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>{r.createdAt}</div>
                </div>
              ),
            }))}
          />
        ) : (
          <span style={{ color: '#999' }}>暂无审批记录</span>
        )}
      </Card>

      <Modal
        title={`审批 - ${detail.code}`}
        open={approveOpen}
        onCancel={() => setApproveOpen(false)}
        onOk={submitApproval}
        confirmLoading={acting}
        okText="确定"
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

function StatusTagLike({ action }) {
  return (
    <span style={{ marginLeft: 8, color: action === 'APPROVE' ? '#389e0d' : '#cf1322' }}>
      {APPROVAL_ACTION_NAMES[action]}
    </span>
  );
}
