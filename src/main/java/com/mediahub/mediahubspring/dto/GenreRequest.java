package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class GenreRequest {

    @NotBlank(message = "Name is required")
    private String name;

    public GenreRequest() {
    }

    public GenreRequest(String name) {
        this.name = name;
    }

    // GETTERS

    public String getName() {
        return this.name;
    }


    // SETTERS
    public void setName(String name) {
        this.name = name;
    }
}
