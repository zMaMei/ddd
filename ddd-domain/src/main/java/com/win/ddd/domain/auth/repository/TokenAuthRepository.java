package com.win.ddd.domain.auth.repository;

import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Token;

import java.util.Optional;

public interface TokenAuthRepository {
    Optional<TokenAuth> findByToken(Token token);
    void save(TokenAuth tokenAuth);
}
