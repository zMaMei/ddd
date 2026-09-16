import { useEffect, useState } from 'react';
import { Card, Col, Progress, Row, Select, Space, Spin, Statistic, message } from 'antd';
import dayjs from 'dayjs';
import { listBalances } from '../api/leave';

const { Option } = Select;

export default function Balances() {
  const [year, setYear] = useState(dayjs().year());
  const [balances, setBalances] = useState(null);

  useEffect(() => {
    setBalances(null);
    listBalances(year)
      .then(setBalances)
      .catch((e) => message.error(e.message));
  }, [year]);

  const years = [dayjs().year(), dayjs().year() - 1, dayjs().year() - 2];

  return (
    <Card
      title="假期余额"
      extra={
        <Select value={year} onChange={setYear} style={{ width: 110 }}>
          {years.map((y) => (
            <Option key={y} value={y}>
              {y} 年
            </Option>
          ))}
        </Select>
      }
    >
      {!balances ? (
        <Spin style={{ display: 'block', marginTop: 60 }} />
      ) : (
        <Row gutter={16}>
          {balances.map((b) => {
            const used = b.usedDays + b.frozenDays;
            const percent = b.totalDays > 0 ? Math.min(100, (used / b.totalDays) * 100) : 0;
            return (
              <Col span={8} key={b.leaveType}>
                <Card size="small" title={b.leaveTypeName} style={{ marginBottom: 16 }}>
                  <Statistic
                    title="剩余（天）"
                    value={b.remainingDays}
                    precision={1}
                    suffix={` / ${b.totalDays}`}
                  />
                  <Progress percent={percent} showInfo={false} style={{ marginTop: 8 }} />
                  <Space size="large" style={{ marginTop: 8, color: '#888' }}>
                    <span>已用 {b.usedDays}</span>
                    <span>冻结 {b.frozenDays}</span>
                  </Space>
                </Card>
              </Col>
            );
          })}
          {!balances.length && <span style={{ color: '#999' }}>该年度暂无余额数据</span>}
        </Row>
      )}
    </Card>
  );
}
