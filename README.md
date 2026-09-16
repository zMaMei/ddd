# DDD 基础架构项目

基于领域驱动设计（DDD）架构的 Spring Boot 项目模板。

## 项目结构

```
src/main/java/com/win/ddd/
├── common/                          # 公共模块
│   └── domain/                      # 领域层公共抽象
│       ├── AbstractValueObject.java # 值对象基类
│       ├── AbstractCode.java        # 标识值对象基类
│       ├── AbstractEntity.java      # 实体基类
│       └── StatusMachine.java       # 状态机接口
├── domain/                          # 领域层（业务核心）
│   └── {业务域}/
│       ├── model/                   # 领域模型
│       │   ├── entity/             # 实体
│       │   ├── valueobject/        # 值对象
│       │   └── constant/           # 枚举常量
│       ├── repository/             # 仓储接口
│       └── service/                # 领域服务
├── application/                     # 应用层（用例编排）
│   ├── command/                    # 命令对象
│   ├── dto/                        # 数据传输对象
│   └── service/                    # 应用服务
├── infrastructure/                  # 基础设施层（技术实现）
│   ├── persistence/                # 持久化
│   │   ├── pojo/                  # 数据对象
│   │   ├── dao/                   # 数据访问对象
│   │   └── converter/             # 对象转换器
│   └── {其他技术实现}/
└── userinterface/                   # 用户接口层
    └── web/                        # Web 接口
        ├── controller/            # 控制器
        └── pojo/                  # 视图对象
```

## DDD 分层说明

1. **领域层（Domain）**：业务核心，不依赖任何技术细节
2. **应用层（Application）**：编排用例，协调领域对象
3. **基础设施层（Infrastructure）**：技术实现，如数据库、消息队列
4. **用户接口层（User Interface）**：对外暴露的接口

## 技术栈

- Java 21
- Spring Boot 4.1.0
- Spring Data JPA
- H2 Database（开发环境）

## 快速开始

```bash
mvn clean install
mvn spring-boot:run
```

访问 H2 控制台：http://localhost:8080/h2-console
