package com.win.ddd.userinterface.web.controller;

import com.win.ddd.application.command.LoginCommand;
import com.win.ddd.application.command.RegisterCommand;
import com.win.ddd.application.dto.AuthResult;
import com.win.ddd.application.service.DepartmentService;
import com.win.ddd.application.service.LoginService;
import com.win.ddd.application.service.RegisterService;
import com.win.ddd.userinterface.web.pojo.LoginRequest;
import com.win.ddd.userinterface.web.pojo.RegisterRequest;
import com.win.ddd.userinterface.web.pojo.ResultVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RequestMapping("/api/v1/auth")
@RestController
public class AuthController {

    private final RegisterService registerService;
    private final LoginService loginService;

    public AuthController(RegisterService registerService,LoginService loginService) {
        this.registerService = registerService;
        this.loginService = loginService;
    }

    @PostMapping("/register")
    public ResultVO<AuthResult> register(@Valid @RequestBody RegisterRequest request){
        RegisterCommand command = new RegisterCommand(
                request.username(), request.password(), request.name(), request.departmentCode());
        return ResultVO.success(registerService.register(command));
    }

    @PostMapping("/login")
    public ResultVO<AuthResult> login(@Valid @RequestBody LoginRequest request){
        LoginCommand command = new LoginCommand(
                request.username(),request.password()
        );
        return ResultVO.success(loginService.login(command));
    }

}
