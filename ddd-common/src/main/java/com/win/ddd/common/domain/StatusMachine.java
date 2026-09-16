package com.win.ddd.common.domain;

import java.util.Collection;

/**
 * 状态机接口：状态流转必须经过白名单校验，非法流转直接抛异常。
 */
public interface StatusMachine<T extends StatusMachine<T>> {

    Collection<T> getFlowToCollection();

    default boolean canFlowTo(T target) {
        if (target == null) {
            return false;
        }
        return getFlowToCollection().contains(target);
    }

    default T flowTo(T target) {
        if (!canFlowTo(target)) {
            throw new IllegalStateException("状态%s无法流转到状态%s".formatted(this, target));
        }
        return target;
    }
}
