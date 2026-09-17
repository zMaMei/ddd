package com.win.ddd.infrastructure.persistence.dao;

import com.win.ddd.infrastructure.persistence.pojo.TokenAuthDO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenAuthDAO extends JpaRepository<TokenAuthDO,String> {
}
