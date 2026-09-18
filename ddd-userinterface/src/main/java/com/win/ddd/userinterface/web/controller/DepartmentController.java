package com.win.ddd.userinterface.web.controller;
import com.win.ddd.application.dto.DepartmentResult;
import com.win.ddd.application.service.DepartmentService;
import com.win.ddd.userinterface.web.pojo.ResultVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DepartmentController {
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping("/api/v1/departments")
    public ResultVO<List<DepartmentResult>> departments() {
        return ResultVO.success(departmentService.departments());
    }
}
