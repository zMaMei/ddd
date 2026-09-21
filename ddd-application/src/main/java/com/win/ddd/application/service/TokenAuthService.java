package com.win.ddd.application.service;

import com.win.ddd.application.dto.CurrentUser;
import com.win.ddd.domain.auth.model.entity.Account;
import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Token;
import com.win.ddd.domain.auth.repository.AccountRepository;
import com.win.ddd.domain.auth.repository.TokenAuthRepository;
import com.win.ddd.common.exception.BusinessException;
import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.repository.DepartmentRepository;
import com.win.ddd.domain.employee.model.entity.Employee;
import com.win.ddd.domain.employee.repository.EmployeeRepository;

import java.util.Optional;

public class TokenAuthService {

    private final TokenAuthRepository tokenAuthRepository;
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public TokenAuthService(TokenAuthRepository tokenAuthRepository,AccountRepository accountRepository,EmployeeRepository employeeRepository,DepartmentRepository departmentRepository){
        this.accountRepository = accountRepository;
        this.tokenAuthRepository = tokenAuthRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    public Optional<CurrentUser> resolve(String token){
        TokenAuth tokenAuth = tokenAuthRepository.findByToken(new Token(token))
                .orElseThrow(() -> new BusinessException(40100,"token验证失败"));
        if(tokenAuth.isExpired()){
            throw new BusinessException(40100,"token已过期");
        }
        Account account = accountRepository.findByUsername(tokenAuth.getUsername())
                .orElseThrow(() -> new BusinessException(40100,"用户不存在"));
        Employee employee = employeeRepository.findByCode(account.getEmployeeCode())
                .orElseThrow(() -> new BusinessException(40100,"找不到该员工"));
        Department department = departmentRepository.findByCode(employee.getDepartmentCode())
                .orElseThrow(() -> new BusinessException(40100,"找不到员工所在的部门"));

        return Optional.of(new CurrentUser(
                account.getEmployeeCode().value(),   // code：工号
                account.getCode().value(),           // username：登录名
                employee.getName().value(),          // name：姓名（Name 值对象拆包）
                employee.getDepartmentCode().value(),// departmentCode
                department.getName(),                // departmentName（Department.name 是 String，不用拆）
                account.getRole().name()             // role
        ));
    }
}

