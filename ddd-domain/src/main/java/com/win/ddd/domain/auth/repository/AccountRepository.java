package com.win.ddd.domain.auth.repository;

import com.win.ddd.domain.auth.model.entity.Account;
import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Username;

import java.util.Optional;

public interface AccountRepository {
    Optional<Account> findByUsername(Username username);
    void save(Account account);
}
