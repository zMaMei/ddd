package com.win.ddd.application.service;

import com.win.ddd.application.dto.CurrentUser;
import com.win.ddd.domain.auth.model.valueobject.Token;
import com.win.ddd.domain.auth.repository.AccountRepository;
import com.win.ddd.domain.auth.repository.TokenAuthRepository;

import java.util.Optional;

public class TokenAuthService {

    private final TokenAuthRepository tokenAuthRepository;
    private final AccountRepository accountRepository;

    public TokenAuthService(TokenAuthRepository tokenAuthRepository,AccountRepository accountRepository){
        this.accountRepository = accountRepository;
        this.tokenAuthRepository = tokenAuthRepository;
    }

    public Optional<CurrentUser> resolve(String token){
        return tokenAuthRepository.findByToken(new Token(token))
        .filter(t -> !t.isExpired())
        .flatMap(t -> accountRepository.findByUsername(t.getUsername()))
        .map(a -> new CurrentUser(a.getEmployeeCode().value(), a.getCode().value(), a.getRole().name()));
    }
}

