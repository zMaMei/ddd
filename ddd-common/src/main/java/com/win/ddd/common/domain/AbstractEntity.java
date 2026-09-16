package com.win.ddd.common.domain;

/**
 * 实体基类：必须有标识（code），且构造即校验非空。
 */
public abstract class AbstractEntity<CODE extends AbstractCode> {
    private final CODE code;

    protected AbstractEntity(CODE code) {
        if (code == null) {
            throw new NullPointerException("code is null");
        }
        this.code = code;
    }

    public CODE getCode() {
        return code;
    }
}
