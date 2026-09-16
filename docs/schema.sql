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
-- 1. 部门表（employee 域实体；运营数据，运行时可增删，不用枚举）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_department (
    code       VARCHAR(32)  NOT NULL COMMENT '部门编码，如 D001',
    name       VARCHAR(64)  NOT NULL COMMENT '部门名，全局唯一',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_department PRIMARY KEY (code),
    CONSTRAINT uk_department_name UNIQUE (name)
);

-- -------------------------------------------------------------
-- 2. 员工档案表（employee 域实体 Employee：姓名/部门归属，与账号分离）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_employee (
    code            VARCHAR(32)  NOT NULL COMMENT '员工工号，业务标识（对应 AbstractCode），如 EMP006',
    name            VARCHAR(64)  NOT NULL COMMENT '姓名（Name 值对象：2~32 字，注册/改名共用规则）',
    department_code VARCHAR(32)  NOT NULL COMMENT '归属部门编码（引用校验 t_department）',
    join_date       DATE         NULL     COMMENT '入职日期（进阶：按工龄生成年假额度）',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_employee PRIMARY KEY (code)
);

-- -------------------------------------------------------------
-- 3. 账号表（auth 域聚合根 Account：登录凭证与角色，工号 1:1 关联档案）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_account (
    username      VARCHAR(32)  NOT NULL COMMENT '登录用户名即账号标识，4~32位字母/数字/下划线',
    password      VARCHAR(100) NOT NULL COMMENT '密码哈希（BCrypt 等），禁止明文',
    role          VARCHAR(16)  NOT NULL COMMENT '角色：STAFF 员工 / MANAGER 主管；注册固定 STAFF',
    employee_code VARCHAR(32)  NOT NULL COMMENT '关联员工档案（1:1）',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_account PRIMARY KEY (username),
    CONSTRAINT uk_account_employee UNIQUE (employee_code)
);

-- -------------------------------------------------------------
-- 4. 登录凭证表（方案 A：UUID token；若用 JWT 则无需此表）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS t_auth_token (
    token      VARCHAR(64) NOT NULL COMMENT '凭证 UUID',
    username   VARCHAR(32) NOT NULL COMMENT '所属账号',
    expire_at  DATETIME    NOT NULL COMMENT '过期时间（建议签发时间 + 7 天）',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_auth_token PRIMARY KEY (token)
);

CREATE INDEX IF NOT EXISTS idx_token_username ON t_auth_token (username);

-- -------------------------------------------------------------
-- 5. 假期余额表（实体，按 员工+类型+年度 唯一）
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
-- 6. 请假单表（聚合根 LeaveRequest）
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
-- 7. 审批记录表（聚合内实体 ApprovalRecord，隶属请假单聚合）
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
-- 8. 状态流转日志表（可选，建议做：由领域事件驱动写入，
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
-- 初始化数据（对应 data.sql）
-- 种子账号密码均为 123456（password 列为 BCrypt 真实哈希，可直接登录）；
-- 注册接口自助创建的账号角色固定 STAFF，MANAGER 仅由种子数据提供。
-- =============================================================
INSERT INTO t_department (code, name) VALUES
('D001', '研发部'),
('D002', '产品部'),
('D003', '人事部');

INSERT INTO t_employee (code, name, department_code, join_date) VALUES
('EMP001', '张三', 'D001', '2023-07-01'),
('EMP002', '李四', 'D001', '2024-03-15'),
('EMP003', '王五', 'D002', '2022-01-10'),
('MGR001', '赵总', 'D001', '2019-05-20'),
('MGR002', '钱总', 'D002', '2020-11-01');

INSERT INTO t_account (username, password, role, employee_code) VALUES
('zhangsan', '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'STAFF',   'EMP001'),
('lisi',     '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'STAFF',   'EMP002'),
('wangwu',   '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'STAFF',   'EMP003'),
('zhaomgr',  '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'MANAGER', 'MGR001'),
('qianmgr',  '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'MANAGER', 'MGR002');

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
