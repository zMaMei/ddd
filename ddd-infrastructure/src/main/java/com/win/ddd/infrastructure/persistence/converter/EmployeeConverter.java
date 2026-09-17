package com.win.ddd.infrastructure.persistence.converter;

import com.win.ddd.domain.department.model.valueobject.DepartmentCode;
import com.win.ddd.domain.employee.model.entity.Employee;
import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;
import com.win.ddd.domain.employee.model.valueobject.Name;
import com.win.ddd.infrastructure.persistence.pojo.EmployeeDO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
@Component
public class EmployeeConverter {
    public Employee toDomain(EmployeeDO d){
        return new Employee(
                new EmployeeCode(d.getCode()),
                new Name(d.getName()),
                new DepartmentCode(d.getDepartmentCode()),
                d.getJoinDate(),
                d.getCreatedAt()
                );
    }
    public EmployeeDO toDO(Employee employee){
        EmployeeDO employeeDO = new EmployeeDO();
        employeeDO.setCode(employee.getCode().value());
        employeeDO.setName(employee.getName().value());
        employeeDO.setDepartmentCode(employee.getDepartmentCode().value());
        employeeDO.setJoinDate(employee.getJoinDate());
        employeeDO.setCreatedAt(employee.getCreatedAt());
        employeeDO.setUpdatedAt(LocalDateTime.now());
        return employeeDO;
    }
}
