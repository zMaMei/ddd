package com.win.ddd.domain.employee.model.valueobject;

import com.win.ddd.common.domain.AbstractCode;

import java.util.regex.Pattern;

public final class EmployeeCode extends AbstractCode{

    private static final Pattern PATTERN = Pattern.compile("^(EMP|MGR)\\d{3,}$");

    public EmployeeCode(String value) {
        super(value);
        if (value == null || !PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("工号格式不合法");
        }
    }
}
