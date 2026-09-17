package com.win.ddd.domain.auth.model.entity;

import com.win.ddd.common.domain.AbstractEntity;
import com.win.ddd.domain.auth.model.valueobject.Token;
import com.win.ddd.domain.auth.model.valueobject.Username;

import java.time.LocalDateTime;
import java.util.UUID;

public class TokenAuth extends AbstractEntity<Token> {

    private final Username username;
    private LocalDateTime expireAt;
    private LocalDateTime createdAt;

    public TokenAuth(Token code, Username username) {
        super(code);
        this.username = username;
    }

    public Username getUsername() {
        return username;
    }

    public LocalDateTime getExpireAt() {
        return expireAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TokenAuth(Token code, Username username, LocalDateTime expireAt, LocalDateTime createdAt) {
        super(code);
        this.username = username;
        this.expireAt = expireAt;
        this.createdAt = createdAt;
    }

    public boolean isExpired(){
        return LocalDateTime.now().isAfter(expireAt);
    }

    public static TokenAuth issue(Username username){
        LocalDateTime now = LocalDateTime.now();
        return new TokenAuth(new Token(UUID.randomUUID().toString()),username,now.plusDays(7),now);
    }
}
