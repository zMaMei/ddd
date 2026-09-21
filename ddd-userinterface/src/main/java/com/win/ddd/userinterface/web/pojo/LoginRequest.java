package com.win.ddd.userinterface.web.pojo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "用户名不能为空")
        @Pattern(regexp = "^[A-Za-z0-9_]{4,32}$", message = "用户名需为4~32位字母、数字或下划线")
        String username,

        @NotBlank(message = "密码不能为空")
        @Size(min = 6, max = 32, message = "密码长度需在6~32位之间")
        String password
){ }
