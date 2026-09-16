/**
 * 应用层 - 编排用例，协调领域对象完成业务操作。
 * <p>
 * 典型结构：
 * <pre>
 * application/
 *   ├── command/    命令对象（写操作的入参）
 *   ├── query/      查询对象（读操作的入参）
 *   ├── dto/        数据传输对象
 *   └── service/    应用服务
 * </pre>
 */
package com.win.ddd.application;
