package com.win.ddd.domain.employee.model.valueobject;

import com.win.ddd.common.domain.AbstractValueObject;

public class Name extends AbstractValueObject<String> {
    public Name(String value) {
        super(value);
        if (value == null || value.trim().length() < 2 || value.trim().length() > 32){
            throw new IllegalArgumentException("姓名需要为2-32字");
        }
    }
}
