package com.win.ddd.domain.department.model.entity;

import com.win.ddd.common.domain.AbstractEntity;
import com.win.ddd.domain.department.model.valueobject.DepartmentCode;

public class Department extends AbstractEntity<DepartmentCode> {

    private String name;

    public Department(DepartmentCode code) {
        super(code);
    }
}
