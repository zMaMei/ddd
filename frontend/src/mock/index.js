import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

/**
 * 前端内置 Mock：内存数据 + 与设计文档一致的接口行为（含状态机与业务规则）。
 * 仅在 VITE_USE_MOCK=true 时由 src/api/request.js 调用。
 * 后端完成后将开关置 false，本文件不再参与运行。
 */

const CURRENT_YEAR = dayjs().year();

// ---------------- 内存数据 ----------------
const db = {
  employees: [
    { code: 'EMP001', name: '张三', department: '研发部', role: 'STAFF' },
    { code: 'EMP002', name: '李四', department: '研发部', role: 'STAFF' },
    { code: 'EMP003', name: '王五', department: '产品部', role: 'STAFF' },
    { code: 'MGR001', name: '赵总', department: '研发部', role: 'MANAGER' },
    { code: 'MGR002', name: '钱总', department: '产品部', role: 'MANAGER' },
  ],
  balances: [],
  requests: [],
  approvalRecords: [],
  seq: 0,
};

function seedBalances() {
  db.balances = [];
  const quotas = { ANNUAL: 10, SICK: 15, PERSONAL: 5 };
  db.employees.forEach((e) => {
    ['ANNUAL', 'SICK', 'PERSONAL'].forEach((t) => {
      db.balances.push({
        employeeCode: e.code,
        leaveType: t,
        year: CURRENT_YEAR,
        totalDays: t === 'ANNUAL' && e.role === 'MANAGER' ? 15 : quotas[t],
        usedDays: 0,
        frozenDays: 0,
        version: 0,
      });
    });
  });
}

function seedRequests() {
  const d = (n) => dayjs().add(n, 'day').format('YYYY-MM-DD');
  const add = (r, records) => {
    db.requests.push(r);
    records.forEach((rec) => db.approvalRecords.push({ requestCode: r.code, ...rec }));
  };
  add(
    {
      code: nextCode(),
      applicantCode: 'EMP001',
      leaveType: 'SICK',
      startDate: d(-10),
      endDate: d(-9),
      duration: 2,
      reason: '感冒发烧，居家休息',
      status: 'APPROVED',
      version: 2,
      submitTime: ts(-12),
      finishTime: ts(-11),
      createdAt: ts(-12),
      updatedAt: ts(-11),
    },
    [{ approverCode: 'MGR001', action: 'APPROVE', comment: '注意休息', createdAt: ts(-11) }]
  );
  // 扣减对应余额，保证 Mock 数据自洽
  const balance = db.balances.find(
    (b) => b.employeeCode === 'EMP001' && b.leaveType === 'SICK'
  );
  if (balance) balance.usedDays = 2;
  add(
    {
      code: nextCode(),
      applicantCode: 'EMP002',
      leaveType: 'ANNUAL',
      startDate: d(5),
      endDate: d(7),
      duration: 3,
      reason: '陪家人外出旅行',
      status: 'SUBMITTED',
      version: 1,
      submitTime: ts(-1),
      finishTime: null,
      createdAt: ts(-1),
      updatedAt: ts(-1),
    },
    []
  );
  add(
    {
      code: nextCode(),
      applicantCode: 'EMP001',
      leaveType: 'PERSONAL',
      startDate: d(-30),
      endDate: d(-30),
      duration: 1,
      reason: '办理证件',
      status: 'REJECTED',
      version: 2,
      submitTime: ts(-35),
      finishTime: ts(-33),
      createdAt: ts(-35),
      updatedAt: ts(-33),
    },
    [
      {
        approverCode: 'MGR001',
        action: 'REJECT',
        comment: '当周版本封版，请另择时间',
        createdAt: ts(-33),
      },
    ]
  );
}

function ts(offsetDays) {
  return dayjs().add(offsetDays, 'day').format('YYYY-MM-DD HH:mm:ss');
}

function nextCode() {
  db.seq += 1;
  return `LV${dayjs().format('YYYYMMDD')}${String(db.seq).padStart(3, '0')}`;
}

let seeded = false;
function ensureSeed() {
  if (seeded) return;
  seedBalances();
  seedRequests();
  seeded = true;
}

// ---------------- 工具 ----------------
const delay = () => new Promise((r) => setTimeout(r, 150));

function fail(code, message) {
  const err = new Error(message);
  err.code = code;
  throw err;
}

function requireUser(headers) {
  const code = headers['X-Employee-Code'];
  const employee = db.employees.find((e) => e.code === code);
  if (!employee) fail(40100, '未识别当前用户，请重新选择身份');
  return employee;
}

function findRequest(code) {
  const request = db.requests.find((r) => r.code === code);
  if (!request) fail(40400, `请假单 ${code} 不存在`);
  return request;
}

const VALID_TYPES = ['ANNUAL', 'SICK', 'PERSONAL'];
// 与设计文档 1.3 的状态机一致
const FLOW = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED: ['CANCELLED', 'CLOSED'],
  REJECTED: [],
  CANCELLED: [],
  CLOSED: [],
};

function flowTo(request, target) {
  if (!FLOW[request.status]?.includes(target)) {
    fail(41001, `状态${request.status}无法流转到状态${target}`);
  }
}

function calcDuration(startDate, endDate) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return end.diff(start, 'day') + 1;
}

function validatePeriod(me, { leaveType, startDate, endDate }, excludeCode) {
  if (!VALID_TYPES.includes(leaveType)) fail(40000, '假期类型不合法');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || '') || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || '')) {
    fail(40000, '日期格式必须为 yyyy-MM-dd');
  }
  const duration = calcDuration(startDate, endDate);
  if (duration <= 0) fail(41004, '结束日期不能早于开始日期');
  if (duration > 30) fail(41004, '单次请假不能超过 30 天');
  if (dayjs(startDate).isBefore(dayjs().startOf('day'))) {
    fail(41004, '开始日期不能早于今天');
  }
  const overlap = db.requests.find(
    (r) =>
      r.applicantCode === me.code &&
      r.code !== excludeCode &&
      ['SUBMITTED', 'APPROVED'].includes(r.status) &&
      dayjs(startDate).isSameOrBefore(dayjs(r.endDate)) &&
      dayjs(endDate).isSameOrAfter(dayjs(r.startDate))
  );
  if (overlap) {
    fail(41003, `与在途请假单 ${overlap.code} 的时间重叠`);
  }
  return duration;
}

function findBalance(me, leaveType) {
  return (
    db.balances.find(
      (b) => b.employeeCode === me.code && b.leaveType === leaveType && b.year === CURRENT_YEAR
    ) || fail(41002, '未找到对应假期余额')
  );
}

// ---------------- 出参组装（结构对齐设计文档 2.6） ----------------
function toVO(request, { withRecords = false } = {}) {
  const applicant = db.employees.find((e) => e.code === request.applicantCode);
  const base = {
    ...request,
    applicantName: applicant?.name,
    department: applicant?.department,
    leaveTypeName: { ANNUAL: '年假', SICK: '病假', PERSONAL: '事假' }[request.leaveType],
    approvalRecords: undefined,
  };
  if (withRecords) {
    base.approvalRecords = db.approvalRecords
      .filter((a) => a.requestCode === request.code)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(({ requestCode, ...rest }) => rest);
  } else {
    delete base.approvalRecords;
  }
  return base;
}

function paginate(list, params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const size = Math.max(1, Number(params.size) || 10);
  return {
    list: list.slice((page - 1) * size, page * size),
    total: list.length,
    page,
    size,
  };
}

// ---------------- 路由分发 ----------------
export async function mockRequest(method, url, { params, body, headers } = {}) {
  ensureSeed();
  await delay();
  const path = url.split('?')[0];
  const m = method.toUpperCase();

  // ---- 员工 / 余额 ----
  if (m === 'GET' && path === '/api/v1/employees/me') {
    return { ...requireUser(headers) };
  }
  if (m === 'GET' && path === '/api/v1/employees') {
    return db.employees.map(({ code, name, department, role }) => ({ code, name, department, role }));
  }
  if (m === 'GET' && path === '/api/v1/leave-balances') {
    const me = requireUser(headers);
    const year = Number(params?.year) || CURRENT_YEAR;
    return db.balances
      .filter((b) => b.employeeCode === me.code && b.year === year)
      .map((b) => ({
        leaveType: b.leaveType,
        leaveTypeName: { ANNUAL: '年假', SICK: '病假', PERSONAL: '事假' }[b.leaveType],
        year: b.year,
        totalDays: b.totalDays,
        usedDays: b.usedDays,
        frozenDays: b.frozenDays,
        remainingDays: b.totalDays - b.usedDays - b.frozenDays,
      }));
  }

  // ---- 请假单 ----
  if (m === 'POST' && path === '/api/v1/leave-requests') {
    const me = requireUser(headers);
    const duration = validatePeriod(me, body, null);
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const request = {
      code: nextCode(),
      applicantCode: me.code,
      leaveType: body.leaveType,
      startDate: body.startDate,
      endDate: body.endDate,
      duration,
      reason: (body.reason || '').trim(),
      status: 'DRAFT',
      version: 0,
      submitTime: null,
      finishTime: null,
      createdAt: now,
      updatedAt: now,
    };
    if (!request.reason || request.reason.length > 200) fail(40000, '请假事由必须为 1~200 字');
    db.requests.push(request);
    return toVO(request);
  }

  if (m === 'GET' && path === '/api/v1/leave-requests/pending-approvals') {
    const me = requireUser(headers);
    if (me.role !== 'MANAGER') fail(40300, '仅主管可查看待审批列表');
    let list = db.requests.filter(
      (r) => r.status === 'SUBMITTED' && r.applicantCode !== me.code
    );
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(
        (r) => r.code.toLowerCase().includes(kw) || (r.reason || '').toLowerCase().includes(kw)
      );
    }
    list = list.sort((a, b) => (a.submitTime < b.submitTime ? 1 : -1)).map((r) => toVO(r));
    return paginate(list, params);
  }

  if (m === 'GET' && path === '/api/v1/leave-requests') {
    const me = requireUser(headers);
    let list = db.requests.filter((r) => r.applicantCode === me.code);
    if (params?.status) {
      const statuses = String(params.status).split(',');
      list = list.filter((r) => statuses.includes(r.status));
    }
    if (params?.leaveType) {
      list = list.filter((r) => r.leaveType === params.leaveType);
    }
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(
        (r) => r.code.toLowerCase().includes(kw) || (r.reason || '').toLowerCase().includes(kw)
      );
    }
    list = list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((r) => toVO(r));
    return paginate(list, params);
  }

  let match = path.match(/^\/api\/v1\/leave-requests\/([^/]+)$/);
  if (match) {
    const code = match[1];
    const request = findRequest(code);
    const me = requireUser(headers);
    if (m === 'GET') {
      return toVO(request, { withRecords: true });
    }
    if (m === 'PUT') {
      if (request.applicantCode !== me.code) fail(40300, '只能修改自己的请假单');
      if (request.status !== 'DRAFT') fail(41001, '只有草稿状态的请假单可以修改');
      const duration = validatePeriod(me, body, code);
      if (body.version !== request.version) fail(41005, '单据已被他人修改，请刷新后重试');
      if (!body.reason?.trim() || body.reason.trim().length > 200) fail(40000, '请假事由必须为 1~200 字');
      Object.assign(request, {
        leaveType: body.leaveType,
        startDate: body.startDate,
        endDate: body.endDate,
        duration,
        reason: body.reason.trim(),
        version: request.version + 1,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });
      return toVO(request);
    }
  }

  match = path.match(/^\/api\/v1\/leave-requests\/([^/]+)\/(submit|withdraw|cancel|close|approve)$/);
  if (match) {
    const [, code, action] = match;
    const request = findRequest(code);
    const me = requireUser(headers);
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if (action === 'submit') {
      if (request.applicantCode !== me.code) fail(40300, '只能提交自己的请假单');
      flowTo(request, 'SUBMITTED');
      validatePeriod(me, request, code);
      const balance = findBalance(me, request.leaveType);
      if (balance.totalDays - balance.usedDays - balance.frozenDays < request.duration) {
        fail(41002, '假期余额不足');
      }
      request.status = 'SUBMITTED';
      request.submitTime = now;
    } else if (action === 'withdraw') {
      if (request.applicantCode !== me.code) fail(40300, '只能撤回自己的请假单');
      flowTo(request, 'DRAFT');
      request.status = 'DRAFT';
    } else if (action === 'cancel') {
      if (request.applicantCode !== me.code) fail(40300, '只能取消自己的请假单');
      flowTo(request, 'CANCELLED');
      if (dayjs(request.startDate).isBefore(dayjs().startOf('day'))) {
        fail(41004, '已开始的请假单不能取消');
      }
      const balance = findBalance(me, request.leaveType);
      balance.usedDays -= request.duration; // 回滚余额
      request.status = 'CANCELLED';
    } else if (action === 'close') {
      if (request.applicantCode !== me.code) fail(40300, '只能销假自己的请假单');
      flowTo(request, 'CLOSED');
      request.status = 'CLOSED';
    } else if (action === 'approve') {
      if (me.role !== 'MANAGER') fail(40300, '仅主管可审批');
      if (request.applicantCode === me.code) fail(40300, '不能审批自己的请假单');
      if (body?.version !== request.version) fail(41005, '单据已被他人修改，请刷新后重试');
      const target = body?.action === 'APPROVE' ? 'APPROVED' : body?.action === 'REJECT' ? 'REJECTED' : null;
      if (!target) fail(40000, '审批动作不合法');
      flowTo(request, target);
      const comment = (body?.comment || '').trim();
      if (target === 'REJECT' && (!comment || comment.length > 200)) {
        fail(40000, '驳回时必须填写审批意见（1~200 字）');
      }
      if (comment.length > 200) fail(40000, '审批意见不能超过 200 字');
      if (target === 'APPROVED') {
        const balance = findBalance(
          db.employees.find((e) => e.code === request.applicantCode),
          request.leaveType
        );
        if (balance.totalDays - balance.usedDays - balance.frozenDays < request.duration) {
          fail(41002, '假期余额不足，无法审批通过');
        }
        balance.usedDays += request.duration;
      }
      request.status = target;
      request.finishTime = now;
      db.approvalRecords.push({
        requestCode: request.code,
        approverCode: me.code,
        action: body.action,
        comment: comment || null,
        createdAt: now,
      });
    }

    request.version += 1;
    request.updatedAt = now;
    return toVO(request, { withRecords: true });
  }

  fail(40400, `接口不存在：${m} ${path}`);
}
