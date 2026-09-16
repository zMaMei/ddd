package com.win.ddd.common.domain;

/**
 * 标识值对象基类：实体身份证。
 * 不同实体各有自己的 Code 类型（UserId/...），编译期就能防止传错 ID。
 */
public abstract class AbstractCode extends AbstractValueObject<String> {

    protected AbstractCode(String value) {
        super(value);
    }
}
