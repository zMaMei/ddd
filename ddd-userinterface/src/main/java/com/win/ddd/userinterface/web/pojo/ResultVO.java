package com.win.ddd.userinterface.web.pojo;

public record ResultVO<T>(int code, String message, T data) {

    public static <T> ResultVO<T> success(T data) {
        return new ResultVO<>(0, "ok", data);
    }

    public static <T> ResultVO<T> failure(int code, String message) {
        return new ResultVO<>(code, message, null);
    }
}
