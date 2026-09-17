-- =============================================================
-- 初始化种子数据（表结构由 JPA ddl-auto 创建，defer 模式下本文件在其后执行）
-- 种子账号密码均为 123456（BCrypt 哈希）；MANAGER 仅由种子提供，注册固定 STAFF
-- =============================================================

INSERT INTO t_department (department_code, name, created_at) VALUES
('D001', '研发部', CURRENT_TIMESTAMP),
('D002', '产品部', CURRENT_TIMESTAMP),
('D003', '人事部', CURRENT_TIMESTAMP);

INSERT INTO t_employee (code, name, department_code, join_date, created_at, updated_at) VALUES
('EMP001', '张三', 'D001', '2023-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP002', '李四', 'D001', '2024-03-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP003', '王五', 'D002', '2022-01-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MGR001', '赵总', 'D001', '2019-05-20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MGR002', '钱总', 'D002', '2020-11-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 说明：t_leave_balance 的种子数据暂不提供——JPA 只为已编写的实体建表，
-- LeaveBalanceDO（leave 域）实现后再补；在此之前可在余额查询时懒初始化（设计文档 2.10）。

INSERT INTO t_account (username, password, role, employee_code, created_at, updated_at) VALUES
('zhangsan', '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'STAFF',   'EMP001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lisi',     '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'STAFF',   'EMP002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('wangwu',   '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'STAFF',   'EMP003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('zhaomgr',  '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'MANAGER', 'MGR001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('qianmgr',  '$2b$10$plo3nMqeAKJzs7klkbFiY.G4AUfcSR4O5JYL7H76.wBlfTYp.DdS2', 'MANAGER', 'MGR002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
