package com.win.ddd.infrastructure.persistence;

import com.win.ddd.domain.employee.model.entity.Employee;
import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;
import com.win.ddd.domain.employee.repository.EmployeeRepository;
import com.win.ddd.infrastructure.persistence.converter.EmployeeConverter;
import com.win.ddd.infrastructure.persistence.dao.EmployeeDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class EmployeeRepositoryImpl implements EmployeeRepository {

    @Autowired
    private  EmployeeDAO dao;
    @Autowired
    private  EmployeeConverter converter;


    @Override
    public Optional<Employee> findByCode(EmployeeCode code){
        return dao.findById(code.value()).map(converter::toDomain);
    }

    @Override
    public void save(Employee employee) {
        dao.save(converter.toDO(employee));
    }

    @Override
    public EmployeeCode nextCode() {
        String max = dao.findMaxEmployeeCode();
        int next = (max == null) ? 1 : Integer.parseInt(max.substring(3))+1;
        return new EmployeeCode("EMP" + String.format("%03d",next));
    }
}
