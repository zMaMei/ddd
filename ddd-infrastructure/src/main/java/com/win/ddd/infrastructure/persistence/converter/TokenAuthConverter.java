package com.win.ddd.infrastructure.persistence.converter;

import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Token;
import com.win.ddd.domain.auth.model.valueobject.Username;
import com.win.ddd.infrastructure.persistence.pojo.TokenAuthDO;
import org.springframework.stereotype.Component;

@Component
public class TokenAuthConverter {
    public TokenAuth toDomain(TokenAuthDO tokenAuthDO){
        return new TokenAuth(
                new Token(tokenAuthDO.getToken()),
                new Username(tokenAuthDO.getUsername()));
    }

    public TokenAuthDO toDO(TokenAuth tokenAuth){
        TokenAuthDO tokenAuthDO = new TokenAuthDO();
        tokenAuthDO.setToken(tokenAuth.getCode().value());
        tokenAuthDO.setUsername(tokenAuth.getUsername().value());
        tokenAuthDO.setExpireAt(tokenAuth.getExpireAt());
        tokenAuthDO.setCreatedAt(tokenAuth.getCreatedAt());
        return tokenAuthDO;
    }
}
