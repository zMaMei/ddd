package com.win.ddd.infrastructure.persistence.converter;

import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.model.valueobject.DepartmentCode;
import com.win.ddd.infrastructure.persistence.pojo.DepartmentDO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DepartmentConverter{
    public Department toDomain(DepartmentDO d){
        return new Department(new DepartmentCode(d.getDepartmentCode()));
    }

    public DepartmentDO toDO(Department department){
        DepartmentDO departmentDO = new DepartmentDO();
        departmentDO.setDepartmentCode(department.getCode().value());
        departmentDO.setCreatedAt(LocalDateTime.now());
        departmentDO.setName(department.getName());
        return departmentDO;
    }
}
