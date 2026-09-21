package com.win.ddd.infrastructure.persistence.converter;

import com.win.ddd.domain.auth.model.constant.Role;
import com.win.ddd.domain.auth.model.entity.Account;
import com.win.ddd.domain.auth.model.entity.TokenAuth;
import com.win.ddd.domain.auth.model.valueobject.Password;
import com.win.ddd.domain.auth.model.valueobject.Token;
import com.win.ddd.domain.auth.model.valueobject.Username;
import com.win.ddd.domain.employee.model.valueobject.EmployeeCode;
import com.win.ddd.infrastructure.persistence.pojo.AccountDO;
import com.win.ddd.infrastructure.persistence.pojo.TokenAuthDO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
@Component
public class AccountConverter {
    public Account toDomain(AccountDO accountDO){
        return new Account(new Username(accountDO.getUsername()),
                new Password(accountDO.getPassword()),
                new EmployeeCode(accountDO.getEmployeeCode()),
                Role.valueOf(accountDO.getRole()),
                accountDO.getCreatedAt());
    }

    public AccountDO toDO(Account account){
        AccountDO accountDO = new AccountDO();
        accountDO.setEmployeeCode(account.getEmployeeCode().value());
        accountDO.setPassword(account.getPassword().value());
        accountDO.setRole(account.getRole().name());
        accountDO.setUsername(account.getCode().value());
        accountDO.setCreatedAt(account.getCreatedAt());
        accountDO.setUpdatedAt(LocalDateTime.now());
        return accountDO;
    }
}
