package com.mediahub.mediahubspring.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String username;
    private Long userId;
    private java.util.Set<String> roles;

    public AuthResponse(String token, String email, String username, Long userId, java.util.Set<String> roles) {
        this.token = token;
        this.email = email;
        this.username = username;
        this.userId = userId;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public Long getUserId() {
        return userId;
    }

    public java.util.Set<String> getRoles() {
        return roles;
    }

}
