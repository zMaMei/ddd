package com.win.ddd.domain.employee.repository;

import com.win.ddd.domain.employee.model.entity.Employee;
import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;

import java.util.Optional;

public interface EmployeeRepository {
    Optional<Employee> findByCode(EmployeeCode employeeCode);
    void save(Employee employee);
    EmployeeCode nextCode();
}
