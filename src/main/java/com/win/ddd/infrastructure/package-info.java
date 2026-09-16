/**
 * 基础设施层 - 技术实现细节，为领域层和应用层提供技术支撑。
 * <p>
 * 典型结构：
 * <pre>
 * infrastructure/
 *   ├── persistence/     持久化实现
 *   │   ├── pojo/        数据对象（DO）
 *   │   ├── dao/         数据访问对象（DAO/Repository 实现）
 *   │   └── converter/   DO ↔ 领域对象转换器
 *   └── ...              其他技术实现（消息、缓存、外部服务等）
 * </pre>
 */
package com.win.ddd.infrastructure;
