package com.win.ddd.domain.auth.service;

public interface PasswordEncryptor {

    String encode(String raw);

    boolean matches(String raw,String hashed);
}
