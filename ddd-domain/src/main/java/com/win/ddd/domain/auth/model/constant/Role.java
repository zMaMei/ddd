package com.win.ddd.domain.auth.model.constant;

public enum Role {
    STAFF("员工"),
    MANAGER("主管");

    private final String description;

    Role(String description){
        this.description = description;
    }

    public String getDescription(){
        return description;
    }

    public static Role from(String value){
        for(Role r: values()){
            if(r.name().equalsIgnoreCase(value)){
                return r;
            }
        }
        throw new IllegalArgumentException("账号角色不合法 ：" + value);
    }
}
