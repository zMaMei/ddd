import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Statistic, message } from 'antd';
import dayjs from 'dayjs';
import {
  createRequest,
  updateRequest,
  submitRequest,
  getRequestDetail,
  listBalances,
} from '../api/leave';
import { LEAVE_TYPE_NAMES, MAX_LEAVE_DAYS } from '../constants';

const { Option } = Select;
const { TextArea } = Input;

export default function RequestEdit() {
  const { code } = useParams();
  const isEdit = Boolean(code);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [balances, setBalances] = useState([]);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listBalances(dayjs().year())
      .then(setBalances)
      .catch((e) => message.error(e.message));
    if (isEdit) {
      getRequestDetail(code)
        .then((d) => {
          if (d.status !== 'DRAFT') {
            message.warning('只有草稿状态的请假单可以修改');
            navigate(`/requests/${code}`, { replace: true });
            return;
          }
          setDetail(d);
          form.setFieldsValue({
            leaveType: d.leaveType,
            range: [dayjs(d.startDate), dayjs(d.endDate)],
            reason: d.reason,
          });
        })
        .catch((e) => {
          message.error(e.message);
          navigate('/requests', { replace: true });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const leaveType = Form.useWatch('leaveType', form);
  const range = Form.useWatch('range', form);

  const currentBalance = useMemo(
    () => balances.find((b) => b.leaveType === leaveType),
    [balances, leaveType]
  );
  const duration = useMemo(() => {
    if (range?.[0] && range?.[1]) {
      return range[1].diff(range[0], 'day') + 1;
    }
    return null;
  }, [range]);

  const disabledDate = (current) => current && current.isBefore(dayjs().startOf('day'));

  const buildBody = (values) => ({
    leaveType: values.leaveType,
    startDate: values.range[0].format('YYYY-MM-DD'),
    endDate: values.range[1].format('YYYY-MM-DD'),
    reason: values.reason,
  });

  const save = async (thenSubmit) => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        saved = await updateRequest(code, { ...buildBody(values), version: detail.version });
      } else {
        saved = await createRequest(buildBody(values));
      }
      if (thenSubmit) {
        await submitRequest(saved.code);
        message.success('已提交审批');
      } else {
        message.success('草稿已保存');
      }
      navigate(`/requests/${saved.code}`);
    } catch (e) {
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={isEdit ? `编辑请假单 ${code}` : '新建请假单'} style={{ maxWidth: 760 }}>
      {currentBalance && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic title={`${LEAVE_TYPE_NAMES[leaveType]}余额(天)`} value={currentBalance.remainingDays} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="本次时长(天)" value={duration ?? '-'} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="余额是否充足"
                value={duration == null ? '-' : duration <= currentBalance.remainingDays ? '充足' : '不足'}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Form form={form} layout="vertical">
        <Form.Item name="leaveType" label="假期类型" rules={[{ required: true, message: '请选择假期类型' }]}>
          <Select placeholder="请选择">
            {Object.entries(LEAVE_TYPE_NAMES).map(([k, v]) => (
              <Option key={k} value={k}>
                {v}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="range" label={`请假日期（单次不超过 ${MAX_LEAVE_DAYS} 天）`} rules={[{ required: true, message: '请选择请假日期' }]}>
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            disabledDate={disabledDate}
            placeholder={['开始日期', '结束日期']}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="请假事由"
          rules={[
            { required: true, message: '请填写请假事由' },
            { max: 200, message: '事由不能超过 200 字' },
          ]}
        >
          <TextArea rows={4} placeholder="1~200 字" showCount maxLength={200} />
        </Form.Item>
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          showIcon
          message="提交后将校验假期余额与在途单据时间是否重叠，审批通过即扣减余额。"
        />
        <Space>
          <Button onClick={() => navigate(-1)}>返回</Button>
          <Button disabled={saving} onClick={() => save(false)}>
            保存草稿
          </Button>
          <Button type="primary" loading={saving} onClick={() => save(true)}>
            保存并提交
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
