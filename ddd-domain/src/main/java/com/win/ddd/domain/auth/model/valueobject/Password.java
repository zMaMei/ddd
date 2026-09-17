package com.win.ddd.domain.auth.model.valueobject;

import com.win.ddd.common.domain.AbstractValueObject;
import com.win.ddd.domain.auth.service.PasswordEncryptor;

public class Password extends AbstractValueObject<String> {

    public Password(String hashed) {
        super(hashed);
        if (hashed == null || hashed.isBlank()) {
            throw new IllegalArgumentException("密码哈希不能为空");
        }
    }
    public static Password hash(String raw, PasswordEncryptor encryptor) {
        if (raw == null || raw.length() < 6 || raw.length() > 32) {
            throw new IllegalArgumentException("密码长度需在6~32位之间");
        }
        return new Password(encryptor.encode(raw));
    }

    public boolean matches(String raw, PasswordEncryptor encryptor) {
        return encryptor.matches(raw, value());
    }
}
