-- =============================================================
-- 请假审批系统（OA）数据库设计
-- 方言：H2（与项目 application.yml 的内存库一致）
-- 注意：H2 默认模式不支持列内联 COMMENT 子句，直接执行时二选一：
--   a) JDBC URL 追加 ;MODE=MySQL（推荐，本文件可原样执行）
--   b) 删除所有 COMMENT '...' 子句
-- 用法一（推荐，DDD 风格）：仅作表结构参考，由 JPA 实体维护映射
-- 用法二：放到 src/main/resources/schema.sql + data.sql 由 Spring 初始化
-- =============================================================

-- -------------------------------------------------------------
-- 1. 员工表（实体）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_employee (
    code         VARCHAR(32)  NOT NULL COMMENT '员工工号，业务标识（对应 AbstractCode）',
    name         VARCHAR(64)  NOT NULL COMMENT '姓名',
    department   VARCHAR(64)  NOT NULL COMMENT '部门',
    role         VARCHAR(16)  NOT NULL COMMENT '角色：STAFF 员工 / MANAGER 主管',
    join_date    DATE         NULL     COMMENT '入职日期（进阶：按工龄生成年假额度）',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_employee PRIMARY KEY (code)
);

-- -------------------------------------------------------------
-- 2. 假期余额表（实体，按 员工+类型+年度 唯一）
--    独立于请假单聚合，跨聚合操作走领域服务 + 乐观锁
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_leave_balance (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    employee_code VARCHAR(32) NOT NULL COMMENT '员工工号',
    leave_type   VARCHAR(16)  NOT NULL COMMENT '假期类型：ANNUAL/SICK/PERSONAL',
    year         INT          NOT NULL COMMENT '年度',
    total_days   DECIMAL(5,1) NOT NULL COMMENT '年度总额度（支持半天）',
    used_days    DECIMAL(5,1) NOT NULL DEFAULT 0 COMMENT '已用天数（审批通过扣减）',
    frozen_days  DECIMAL(5,1) NOT NULL DEFAULT 0 COMMENT '预占天数（提交预占/进阶方案，简化实现恒为0）',
    version      BIGINT       NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_leave_balance PRIMARY KEY (id),
    CONSTRAINT uk_balance UNIQUE (employee_code, leave_type, year),
    CONSTRAINT ck_balance_non_negative CHECK (used_days >= 0 AND frozen_days >= 0)
);

-- -------------------------------------------------------------
-- 3. 请假单表（聚合根 LeaveRequest）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_leave_request (
    code           VARCHAR(32)  NOT NULL COMMENT '请假单号：LV + yyyyMMdd + 3位序列',
    applicant_code VARCHAR(32)  NOT NULL COMMENT '申请人工号',
    leave_type     VARCHAR(16)  NOT NULL COMMENT '假期类型：ANNUAL/SICK/PERSONAL',
    start_date     DATE         NOT NULL COMMENT '开始日期',
    end_date       DATE         NOT NULL COMMENT '结束日期（含当天）',
    duration       DECIMAL(4,1) NOT NULL COMMENT '时长（天），后端计算，简化=自然日；进阶=工作日',
    reason         VARCHAR(500) NOT NULL COMMENT '请假事由',
    status         VARCHAR(16)  NOT NULL COMMENT '状态：DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED/CLOSED（对应 StatusMachine）',
    version        BIGINT       NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
    submit_time    DATETIME     NULL COMMENT '提交时间',
    finish_time    DATETIME     NULL COMMENT '终态时间（通过/驳回/取消/销假）',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_leave_request PRIMARY KEY (code),
    CONSTRAINT ck_leave_period CHECK (end_date >= start_date),
    CONSTRAINT ck_leave_duration CHECK (duration > 0 AND duration <= 30)
);

-- 查询我的请假单列表（applicant + status + 排序）
CREATE INDEX IF NOT EXISTS idx_leave_applicant ON t_leave_request (applicant_code, status, created_at DESC);
-- 重叠校验（同一申请人在途单据的时间区间比对）
CREATE INDEX IF NOT EXISTS idx_leave_overlap ON t_leave_request (applicant_code, start_date, end_date);

-- -------------------------------------------------------------
-- 4. 审批记录表（聚合内实体 ApprovalRecord，隶属请假单聚合）
--    一张单可有多次提交→撤回→再提交，因此允许多条记录
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_leave_approval_record (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    request_code  VARCHAR(32)  NOT NULL COMMENT '请假单号（聚合外键，无物理外键约束）',
    approver_code VARCHAR(32)  NOT NULL COMMENT '审批人工号',
    action        VARCHAR(16)  NOT NULL COMMENT '动作：APPROVE 通过 / REJECT 驳回',
    comment       VARCHAR(200) NULL     COMMENT '审批意见（驳回时必填）',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_approval_record PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_approval_request ON t_leave_approval_record (request_code, created_at DESC);

-- -------------------------------------------------------------
-- 5. 状态流转日志表（可选，建议做：由领域事件驱动写入，
--    是练习"领域事件 + 事件监听器"的最佳落点）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_leave_request_log (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    request_code VARCHAR(32)  NOT NULL COMMENT '请假单号',
    event_type   VARCHAR(32)  NOT NULL COMMENT '事件：SUBMITTED/WITHDRAWN/APPROVED/REJECTED/CANCELLED/CLOSED',
    from_status  VARCHAR(16)  NOT NULL COMMENT '流转前状态',
    to_status    VARCHAR(16)  NOT NULL COMMENT '流转后状态',
    operator_code VARCHAR(32) NOT NULL COMMENT '操作人工号',
    detail       VARCHAR(500) NULL     COMMENT '附加信息（如审批意见）',
    occurred_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_leave_request_log PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_log_request ON t_leave_request_log (request_code, occurred_at);

-- =============================================================
-- 初始化数据（对应 data.sql；前端模拟登录直接从员工表选人）
-- =============================================================
INSERT INTO t_employee (code, name, department, role, join_date) VALUES
('EMP001', '张三', '研发部', 'STAFF',   '2023-07-01'),
('EMP002', '李四', '研发部', 'STAFF',   '2024-03-15'),
('EMP003', '王五', '产品部', 'STAFF',   '2022-01-10'),
('MGR001', '赵总', '研发部', 'MANAGER', '2019-05-20'),
('MGR002', '钱总', '产品部', 'MANAGER', '2020-11-01');

INSERT INTO t_leave_balance (employee_code, leave_type, year, total_days) VALUES
('EMP001', 'ANNUAL',   2026, 10.0),
('EMP001', 'SICK',     2026, 15.0),
('EMP001', 'PERSONAL', 2026, 5.0),
('EMP002', 'ANNUAL',   2026, 5.0),
('EMP002', 'SICK',     2026, 15.0),
('EMP002', 'PERSONAL', 2026, 5.0),
('EMP003', 'ANNUAL',   2026, 12.0),
('EMP003', 'SICK',     2026, 15.0),
('EMP003', 'PERSONAL', 2026, 5.0),
('MGR001', 'ANNUAL',   2026, 15.0),
('MGR001', 'SICK',     2026, 15.0),
('MGR001', 'PERSONAL', 2026, 5.0),
('MGR002', 'ANNUAL',   2026, 15.0),
('MGR002', 'SICK',     2026, 15.0),
('MGR002', 'PERSONAL', 2026, 5.0);
