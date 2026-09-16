package com.win.ddd.domain.auth.model.valueobject;

import com.win.ddd.common.domain.AbstractCode;

import java.util.regex.Pattern;

public final class Username extends AbstractCode {


    private static final Pattern PATTERN = Pattern.compile("^[A-Za-z0-9_]{3,20}$");
    public Username(String value) {
        super(value);
        if (value == null || !PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("用户名需为4~32位字母、数字或下划线");
        }
    }
}
