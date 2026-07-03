package com.mediahub.mediahubspring.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;


public class ReviewResponse {

    private Long id;
    private Long authorId;
    private String authorUsername;
    private String authorProfileImage;

    @NotBlank
    private String text;

    private Long mediaItemId;
    private String mediaTitle;
    private String mediaPosterUrl;

    private LocalDateTime createdAt;

    private Integer rating;

    public ReviewResponse() {
    }

    public ReviewResponse(Long id,
                          Long authorId,
                          String authorUsername,
                          String authorProfileImage,
                          String text,
                          Long mediaItemId,
                          String mediaTitle,
                          String mediaPosterUrl,
                          LocalDateTime createdAt,
                          Integer rating) {
        this.id = id;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorProfileImage = authorProfileImage;
        this.text = text;
        this.mediaItemId = mediaItemId;
        this.mediaTitle = mediaTitle;
        this.mediaPosterUrl = mediaPosterUrl;
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

    public String getAuthorUsername() {
        return this.authorUsername;
    }

    public String getAuthorProfileImage() {
        return this.authorProfileImage;
    }

    public String getText() {
        return this.text;
    }

    public Long getMediaItemId() {
        return this.mediaItemId;
    }

    public String getMediaTitle() {
        return mediaTitle;
    }

    public String getMediaPosterUrl() {
        return mediaPosterUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Integer getRating() {
        return rating;
    }
}