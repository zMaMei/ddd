package com.win.ddd.userinterface.web.advice;

import com.win.ddd.common.exception.BusinessException;
import com.win.ddd.userinterface.web.pojo.ResultVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常翻译：任何异常都转成统一响应 {code, message, data=null}，
 * HTTP 状态保持 200，错误码在 body 中（与设计文档 2.0 约定一致）。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 业务异常：错误码与提示信息由领域/应用层抛出时决定，直接透传给前端 */
    @ExceptionHandler(BusinessException.class)
    public ResultVO<Void> handleBusiness(BusinessException e) {
        return ResultVO.failure(e.getCode(), e.getMessage());
    }

    /** 参数校验失败（@Valid）：取第一个字段的提示信息，code=40000 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResultVO<Void> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("参数校验失败");
        return ResultVO.failure(40000, message);
    }

    /** 兜底：未预期异常不向前端暴露堆栈，只记日志 */
    @ExceptionHandler(Exception.class)
    public ResultVO<Void> handleUnexpected(Exception e) {
        log.error("未处理异常", e);
        return ResultVO.failure(50000, "系统内部错误");
    }
}
