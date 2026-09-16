# DDD 基础架构项目

基于领域驱动设计（DDD）架构的 Spring Boot 多模块项目模板。

## 项目结构（多模块，依赖逐层递进）

```
ddd/                                 # 根 pom：聚合 + 继承 spring-boot-starter-parent
├── ddd-common/                      # 公共模块（纯 Java，零第三方依赖）
│   └── com.win.ddd.common.domain/   # AbstractValueObject / AbstractCode / AbstractEntity / StatusMachine
├── ddd-domain/                      # 领域层（业务核心，不依赖任何 Spring 技术）→ 依赖 common
│   └── com.win.ddd.domain.{业务域}/
│       ├── model/
│       │   ├── entity/             # 实体
│       │   ├── valueobject/        # 值对象
│       │   └── constant/           # 枚举常量
│       ├── repository/             # 仓储接口
│       └── service/                # 领域服务（端口定义）
├── ddd-application/                 # 应用层（用例编排）→ 依赖 domain
│   └── com.win.ddd.application/
│       ├── command/                # 命令对象
│       ├── query/                  # 查询对象
│       ├── dto/                    # 数据传输对象
│       └── service/                # 应用服务
├── ddd-infrastructure/              # 基础设施层（技术实现）→ 依赖 domain
│   └── com.win.ddd.infrastructure/
│       ├── persistence/            # PO / DAO / 领域对象转换器（JPA）
│       └── security/               # 密码加密等技术实现（spring-security-crypto）
├── ddd-userinterface/               # 用户接口层 → 依赖 application
│   └── com.win.ddd.userinterface.web/
│       ├── controller/             # REST 控制器
│       └── pojo/                   # 视图对象、统一响应体
└── ddd-bootstrap/                   # 启动装配 → 依赖 application + infrastructure + userinterface
    ├── DddApplication.java         # Spring Boot 启动类
    └── resources/application.yml   # 配置文件；数据库驱动（H2）也在此装配
```

依赖递进：`common ← domain ← application ← userinterface`，`infrastructure` 只依赖 `domain`（实现领域层端口），
`bootstrap` 负责把所有模块装配成可执行应用。领域层不感知 Spring/JPA；换数据库只改 bootstrap。

## DDD 分层说明

1. **领域层（Domain）**：业务核心，不依赖任何技术细节
2. **应用层（Application）**：编排用例，协调领域对象
3. **基础设施层（Infrastructure）**：技术实现，如数据库、消息队列
4. **用户接口层（User Interface）**：对外暴露的接口

## 技术栈

- Java 21
- Spring Boot 4.1.0（多模块）
- Spring Data JPA
- Spring Security Crypto（仅 BCrypt 工具类）
- H2 Database（开发环境，由 bootstrap 模块装配）

## 快速开始

```bash
# Maven 默认 JDK 需为 21（本机可用 ~/.jdks/ms-21.0.9）
JAVA_HOME=~/.jdks/ms-21.0.9 mvn clean package

# 运行（fat jar 在 bootstrap 模块）
java -jar ddd-bootstrap/target/ddd-bootstrap-1.0.0-SNAPSHOT.jar
```

访问 H2 控制台：http://localhost:8080/h2-console
