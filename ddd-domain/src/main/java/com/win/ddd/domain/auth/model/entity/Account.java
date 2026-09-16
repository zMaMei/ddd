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
}
