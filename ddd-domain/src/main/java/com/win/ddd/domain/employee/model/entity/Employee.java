package com.win.ddd.domain.employee.model.entity;

import com.win.ddd.common.domain.AbstractEntity;
import com.win.ddd.domain.department.model.valueobject.DepartmentCode;
import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;
import com.win.ddd.domain.employee.model.valueobject.Name;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Employee extends AbstractEntity<EmployeeCode> {

    private Name name;
    private DepartmentCode departmentCode;
    private LocalDate joinDate;
    private LocalDateTime createdAt;

    public Employee(EmployeeCode code) {
        super(code);
    }

    public Employee(EmployeeCode code, Name name, DepartmentCode departmentCode, LocalDate joinDate, LocalDateTime createdAt) {
        super(code);
        this.name = name;
        this.departmentCode = departmentCode;
        this.joinDate = joinDate;
        this.createdAt = createdAt;
    }

    public Name getName() {
        return name;
    }

    public DepartmentCode getDepartmentCode() {
        return departmentCode;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
