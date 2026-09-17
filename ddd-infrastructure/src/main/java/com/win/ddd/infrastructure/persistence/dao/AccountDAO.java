package com.win.ddd.infrastructure.persistence.dao;

import com.win.ddd.infrastructure.persistence.pojo.AccountDO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountDAO extends JpaRepository<AccountDO,String> {
}
