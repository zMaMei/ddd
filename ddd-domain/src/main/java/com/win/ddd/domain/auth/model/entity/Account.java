package com.win.ddd.domain.auth.model.entity;

import com.win.ddd.common.domain.AbstractEntity;
import com.win.ddd.domain.auth.model.constant.Role;
import com.win.ddd.domain.auth.model.valueobject.Password;
import com.win.ddd.domain.auth.model.valueobject.Username;
import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;

import java.time.LocalDateTime;

public class Account extends AbstractEntity<Username> {

    private Password password;
    private EmployeeCode employeeCode;
    private Role role;
    private LocalDateTime createdAt;

    public Account(Username code) {
        super(code);
    }


    public Password getPassword() {
        return password;
    }

    public EmployeeCode getEmployeeCode() {
        return employeeCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Role getRole() {
        return role;
    }

    public Account(Username code, Password password, EmployeeCode employeeCode, Role role, LocalDateTime createdAt) {
        super(code);
        this.password = password;
        this.employeeCode = employeeCode;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static Account register(Username username,Password password,EmployeeCode employeeCode){
        return new Account(username,password,employeeCode,Role.STAFF,LocalDateTime.now());
    }
}
