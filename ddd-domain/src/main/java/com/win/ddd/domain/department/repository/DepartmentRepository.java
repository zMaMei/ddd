package com.win.ddd.domain.department.repository;

import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.model.valueobject.DepartmentCode;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository {
    public Optional<Department> findByCode(DepartmentCode code);
    void save(Department department);
    public List<Department> findAll();
}
