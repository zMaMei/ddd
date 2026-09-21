package com.win.ddd.application.service;

import com.win.ddd.application.command.RegisterCommand;
import com.win.ddd.application.dto.AuthResult;
import com.win.ddd.application.dto.CurrentUser;
import com.win.ddd.common.exception.BusinessException;
import com.win.ddd.domain.auth.model.constant.Role;
import com.win.ddd.domain.auth.model.entity.Account;
import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Password;
import com.win.ddd.domain.auth.model.valueobject.Username;
import com.win.ddd.domain.auth.repository.AccountRepository;
import com.win.ddd.domain.auth.repository.TokenAuthRepository;
import com.win.ddd.domain.auth.service.PasswordEncryptor;
import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.model.valueobject.DepartmentCode;
import com.win.ddd.domain.department.repository.DepartmentRepository;
import com.win.ddd.domain.employee.model.entity.Employee;
import com.win.ddd.domain.employee.model.valueobject.Name;
import com.win.ddd.domain.employee.repository.EmployeeRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;


public class RegisterService {
    private final TokenAuthRepository tokenAuthRepository;
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncryptor passwordEncryptor;

    public RegisterService(TokenAuthRepository tokenAuthRepository, AccountRepository accountRepository, EmployeeRepository employeeRepository, DepartmentRepository departmentRepository, PasswordEncryptor passwordEncryptor) {
        this.tokenAuthRepository = tokenAuthRepository;
        this.accountRepository = accountRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncryptor = passwordEncryptor;
    }


    /** 用例级事务：档案/账号/凭证三张表整体成功或整体回滚 */
    @Transactional
    public AuthResult register(RegisterCommand command) {
        Username username = new Username(command.username());
        if(accountRepository.findByUsername(username).isPresent()) {
            throw new BusinessException(40900,"用户已被注册");
        }

        DepartmentCode departmentCode = new DepartmentCode(command.departmentCode());
        Department department = departmentRepository.findByCode(departmentCode)
                .orElseThrow(() -> new BusinessException(40400,"部门不存在"));

        Employee employee = new Employee(
                employeeRepository.nextCode(),
                new Name(command.name()),
                departmentCode,
                LocalDate.now(),
                LocalDateTime.now());
        employeeRepository.save(employee);

        Account account = Account.register(username,
                Password.hash(command.password(),passwordEncryptor),
                employee.getCode());
        accountRepository.save(account);

        TokenAuth tokenAuth = TokenAuth.issue(username);
        tokenAuthRepository.save(tokenAuth);

        return new AuthResult(tokenAuth.getCode().value(),
                new CurrentUser(employee.getCode().value(),
                        account.getCode().value(),
                        employee.getName().value(),
                        department.getCode().value(),
                        department.getName(),
                        Role.STAFF.name()));
    }
}
