package com.win.ddd.infrastructure.persistence;

import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Token;
import com.win.ddd.domain.auth.repository.TokenAuthRepository;
import com.win.ddd.infrastructure.persistence.converter.TokenAuthConverter;
import com.win.ddd.infrastructure.persistence.dao.TokenAuthDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public class TokenAuthRepositoryImpl implements TokenAuthRepository {

    @Autowired
    private TokenAuthDAO dao;
    @Autowired
    private TokenAuthConverter tokenAuthConverter;

    @Override
    public Optional<TokenAuth> findByToken(Token token) {
        return dao.findById(token.value()).map(tokenAuthConverter::toDomain);
    }

    @Override
    public void save(TokenAuth tokenAuth) {          // 登录签发凭证时会用到
        dao.save(tokenAuthConverter.toDO(tokenAuth));
    }
}
