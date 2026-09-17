package com.win.ddd.infrastructure.persistence;

import com.win.ddd.domain.auth.model.entity.Account;
import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Username;
import com.win.ddd.domain.auth.repository.AccountRepository;
import com.win.ddd.infrastructure.persistence.converter.AccountConverter;
import com.win.ddd.infrastructure.persistence.dao.AccountDAO;
import jakarta.persistence.Access;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class AccountRepositoryImpl implements AccountRepository {
    @Autowired
    private AccountDAO dao;
    @Autowired
    private AccountConverter converter;

    @Override
    public Optional<Account> findByUsername(Username username) {
        return dao.findById(username.value()).map(converter::toDomain);
    }

    @Override
    public void save(Account account) {
        dao.save(converter.toDO(account));
    }
}
