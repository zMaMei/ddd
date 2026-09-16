import { Tag } from 'antd';
import { STATUS_NAMES, STATUS_COLORS } from '../constants';

export default function StatusTag({ status }) {
  if (!status) return null;
  return <Tag color={STATUS_COLORS[status]}>{STATUS_NAMES[status] || status}</Tag>;
}
