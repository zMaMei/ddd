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
}
