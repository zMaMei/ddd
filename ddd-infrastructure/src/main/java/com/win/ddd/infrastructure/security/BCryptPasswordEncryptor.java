package com.win.ddd.infrastructure.security;

import com.win.ddd.domain.auth.service.PasswordEncryptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BCryptPasswordEncryptor implements PasswordEncryptor {

    private final BCryptPasswordEncoder delegate = new BCryptPasswordEncoder();

    @Override
    public String encode(String raw) {
        return delegate.encode(raw);
    }

    @Override
    public boolean matches(String raw, String hashed) {
        return delegate.matches(raw, hashed);
    }
}
