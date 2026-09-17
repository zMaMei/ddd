package com.win.ddd.userinterface.web.interceptor;

import com.win.ddd.application.service.TokenAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private TokenAuthService tokenAuthService;
    private ObjectMapper objectMapper;

    public AuthInterceptor(TokenAuthService tokenAuthService,ObjectMapper objectMapper){
        this.tokenAuthService = tokenAuthService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,Object handler){
        String auth = request.getHeader("Authorization");
        if(auth == null || !auth.startsWith("Bearer ")){
            return reject(response,"未登录或凭证已过期");
        }
        String token = auth.substring("Bearer ".length());
        return tokenAuthService.resolve(token)
                .map(user ->{
                    request.setAttribute("currentUser",user);
                    return true;
                })
                .orElseGet(()->reject(response,"未登录或凭证过期"));
    }

    private Boolean reject(HttpServletResponse response, String message) {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        try {
            response.getWriter().write(objectMapper.writeValueAsString(
                    Map.of("code",40100,"message",message,"data","")));
        } catch (Exception ignored) {
        }
        return false;
    }
}
