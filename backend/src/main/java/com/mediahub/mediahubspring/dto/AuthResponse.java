package com.mediahub.mediahubspring.dto;

public class AuthResponse {
    private String token;
    private String email;
    private Long userId;

    public AuthResponse(String token, String email, Long userId) {
        this.token = token;
        this.email = email;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public Long getUserId() {
        return userId;
    }

}
