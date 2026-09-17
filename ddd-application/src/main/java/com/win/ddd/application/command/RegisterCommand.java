package com.win.ddd.application.command;

public record RegisterCommand(String username, String password, String name, String departmentCode) {}