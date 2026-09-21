package com.win.ddd.application.service;

import com.win.ddd.application.command.LoginCommand;
import com.win.ddd.application.dto.AuthResult;
import com.win.ddd.application.dto.CurrentUser;
import com.win.ddd.common.exception.BusinessException;
import com.win.ddd.domain.auth.model.constant.Role;
import com.win.ddd.domain.auth.model.entity.Account;
import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Username;
import com.win.ddd.domain.auth.repository.AccountRepository;
import com.win.ddd.domain.auth.repository.TokenAuthRepository;
import com.win.ddd.domain.auth.service.PasswordEncryptor;
import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.repository.DepartmentRepository;
import com.win.ddd.domain.employee.model.entity.Employee;
import com.win.ddd.domain.employee.repository.EmployeeRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public class LoginService {

    private final TokenAuthRepository tokenAuthRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncryptor passwordEncryptor;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public LoginService(TokenAuthRepository tokenAuthRepository, AccountRepository accountRepository, PasswordEncryptor passwordEncryptor,EmployeeRepository employeeRepository,DepartmentRepository departmentRepository) {
        this.tokenAuthRepository = tokenAuthRepository;
        this.accountRepository = accountRepository;
        this.passwordEncryptor = passwordEncryptor;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public AuthResult login(LoginCommand command){
        Account account = accountRepository.findByUsername(new Username(command.username()))
                .orElseThrow(() -> new BusinessException(40000,"用户名或密码错误"));
        if(!account.getPassword().matches(command.password(),passwordEncryptor)){
            throw new BusinessException(40000,"用户名或密码错误");
        }
        TokenAuth tokenAuth = TokenAuth.issue(new Username(command.username()));
        tokenAuthRepository.save(tokenAuth);
        Employee employee = employeeRepository.findByCode(account.getEmployeeCode())
                .orElseThrow(() -> new BusinessException(40100,"没有找到该员工"));
        Department department = departmentRepository.findByCode(employee.getDepartmentCode())
                .orElseThrow(() -> new BusinessException(40100,"没有找到对应部门"));
        return new AuthResult(tokenAuth.getCode().value(),
                new CurrentUser(
                        account.getEmployeeCode().value()
                        ,account.getCode().value()
                        ,employee.getName().value()
                        ,employee.getDepartmentCode().value()
                        ,department.getName()
                        ,account.getRole().name()
                )
        );
    }
}
