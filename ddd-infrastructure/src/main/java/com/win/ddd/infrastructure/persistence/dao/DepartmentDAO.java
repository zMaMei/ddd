package com.win.ddd.infrastructure.persistence.dao;

import com.win.ddd.domain.department.model.valueobject.DepartmentCode;
import com.win.ddd.infrastructure.persistence.pojo.DepartmentDO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentDAO extends JpaRepository<DepartmentDO,String> {
}
