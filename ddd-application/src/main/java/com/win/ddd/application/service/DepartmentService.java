package com.win.ddd.application.service;

import com.win.ddd.application.dto.DepartmentResult;
import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.repository.DepartmentRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository){
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public List<DepartmentResult> departments(){
        return departmentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DepartmentResult toDTO(Department department){
        return new DepartmentResult(department.getCode().value(),department.getName());
    }
}
