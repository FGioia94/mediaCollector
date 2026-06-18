package com.mediahub.mediahubspring.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;


public class ReviewResponse {

    private Long id;
    private Long authorId;

    @NotBlank
    private String text;

    private Long mediaItemId;

    private LocalDateTime createdAt;

    private Integer rating;

    public ReviewResponse() {
    }

    public ReviewResponse(Long id,
                          Long authorId,
                          String text,
                          Long mediaItemId,
                          LocalDateTime createdAt,
                          Integer rating) {
        this.id = id;
        this.authorId = authorId;
        this.text = text;
        this.mediaItemId = mediaItemId;
        this.createdAt = createdAt;
        this.rating = rating;
    }

    // GETTERS


    public Long getId() {
        return id;
    }

    public Long getAuthorId() {
        return this.authorId;
    }

    public String getText() {
        return this.text;
    }

    public Long getMediaItemId() {
        return this.mediaItemId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Integer getRating() {
        return rating;
    }
}