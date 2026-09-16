package com.win.ddd.common.domain;

import java.util.Objects;

/**
 * 值对象基类：不可变 + 按值判等。
 */
public abstract class AbstractValueObject<T> {
    private final T value;

    protected AbstractValueObject(T value) {
        this.value = value;
    }

    public final T value() {
        return value;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        return Objects.equals(value, ((AbstractValueObject<?>) o).value);
    }

    @Override
    public final int hashCode() {
        return Objects.hashCode(value);
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }
}
