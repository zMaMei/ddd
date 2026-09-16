/**
 * 领域层 - 业务核心，不依赖任何技术细节。
 * <p>
 * 按业务域（bounded context）组织子包：
 * <pre>
 * domain/
 *   └── {业务域}/
 *       ├── model/
 *       │   ├── entity/        实体
 *       │   ├── valueobject/   值对象
 *       │   └── constant/      枚举常量
 *       ├── repository/        仓储接口
 *       └── service/           领域服务
 * </pre>
 */
package com.win.ddd.domain;
