package com.win.ddd.config;

import com.win.ddd.application.service.DepartmentService;
import com.win.ddd.application.service.LoginService;
import com.win.ddd.application.service.RegisterService;
import com.win.ddd.application.service.TokenAuthService;
import com.win.ddd.domain.auth.repository.AccountRepository;
import com.win.ddd.domain.auth.repository.TokenAuthRepository;
import com.win.ddd.domain.auth.service.PasswordEncryptor;
import com.win.ddd.domain.department.repository.DepartmentRepository;
import com.win.ddd.domain.employee.repository.EmployeeRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {

    @Bean   // 方法名 = Bean 名称；参数由 Spring 自动注入（infrastructure 的 @Repository 实现类）
    public TokenAuthService tokenAuthService(TokenAuthRepository tokenAuthRepository,
                                             AccountRepository accountRepository,EmployeeRepository employeeRepository,DepartmentRepository departmentRepository) {
        return new TokenAuthService(tokenAuthRepository, accountRepository,employeeRepository,departmentRepository);
    }

    @Bean
    public DepartmentService departmentService(DepartmentRepository departmentRepository){
        return new DepartmentService(departmentRepository);
    }

    @Bean
    public LoginService loginService(TokenAuthRepository tokenAuthRepository, AccountRepository accountRepository, PasswordEncryptor passwordEncryptor,EmployeeRepository employeeRepository,DepartmentRepository departmentRepository) {
        return new LoginService(tokenAuthRepository,accountRepository,passwordEncryptor,employeeRepository,departmentRepository);
    }

    @Bean
    public RegisterService registerService(TokenAuthRepository tokenAuthRepository,
                                           AccountRepository accountRepository,
                                           DepartmentRepository departmentRepository,
                                           EmployeeRepository employeeRepository,
                                           PasswordEncryptor passwordEncryptor){
        return new RegisterService(tokenAuthRepository,accountRepository,employeeRepository,departmentRepository,passwordEncryptor);
    }
}