package com.win.ddd.infrastructure.persistence.dao;

import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;
import com.win.ddd.infrastructure.persistence.pojo.EmployeeDO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployeeDAO extends JpaRepository<EmployeeDO,String> {
    @Query("select max(e.code) from EmployeeDO e where e.code like 'EMP%'")
    String findMaxEmployeeCode();
}
