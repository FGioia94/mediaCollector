package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class GenreResponse {

    private Long id;
    private String name;
    private LocalDateTime createdAt;

    public GenreResponse() {
    }

    public GenreResponse(Long id, String name, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    // GETTERS


    public Long getId() {
        return id;
    }
    public String getName() {
        return this.name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
