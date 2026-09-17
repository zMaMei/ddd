package com.win.ddd.infrastructure.persistence;

import com.win.ddd.domain.department.model.entity.Department;
import com.win.ddd.domain.department.model.valueobject.DepartmentCode;
import com.win.ddd.domain.department.repository.DepartmentRepository;
import com.win.ddd.infrastructure.persistence.converter.DepartmentConverter;
import com.win.ddd.infrastructure.persistence.dao.DepartmentDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class DepartmentRepositoryImpl implements DepartmentRepository {

    @Autowired
    private DepartmentDAO dao;
    @Autowired
    private DepartmentConverter converter;

    @Override
    public Optional<Department> findByCode(DepartmentCode code) {
        return dao.findById(code.value()).map(converter::toDomain);
    }

    @Override
    public void save(Department department){
        dao.save(converter.toDO(department));
    }
}
