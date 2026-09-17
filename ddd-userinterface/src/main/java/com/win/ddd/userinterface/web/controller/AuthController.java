package com.win.ddd.userinterface.web.controller;

import com.win.ddd.application.command.RegisterCommand;
import com.win.ddd.application.dto.AuthResult;
import com.win.ddd.application.service.RegisterService;
import com.win.ddd.userinterface.web.pojo.RegisterRequest;
import com.win.ddd.userinterface.web.pojo.ResultVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/v1/auth")
@RestController
public class AuthController {

    private final RegisterService registerService;

    public AuthController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping("/register")
    public ResultVO<AuthResult> register(@Valid @RequestBody RegisterRequest request){
        RegisterCommand command = new RegisterCommand(
                request.username(), request.password(), request.name(), request.departmentCode());
        return ResultVO.success(registerService.register(command));
    }
}
