package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public class ReviewRequest {

    @NotNull(message = "Author id is required")
    private Long authorId;

    @NotBlank(message = "Review Text is required")
    private String text;

    @NotNull(message = "MediaItem id is required")
    private Long mediaItemId;

    @NotNull(message = "Rating id is required")
    @Min(value = 1, message = "Rating must be >= 1")
    @Max(value = 10, message = "Rating must be <= 10")
    private Integer rating;

    public ReviewRequest() {
    }

    public ReviewRequest(Long authorId,
                         String text,
                         Long mediaItemId,
                         Integer rating) {
        this.authorId = authorId;
        this.text = text;
        this.mediaItemId = mediaItemId;
        this.rating = rating;
    }

    // GETTERS

    public Long getAuthorId() {
        return this.authorId;
    }

    public String getText() {
        return this.text;
    }

    public Long getMediaItemId() {
        return this.mediaItemId;
    }

    public Integer getRating() {
        return rating;
    }

    // SETTERS


    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setMediaItemId(Long mediaItemId) {
        this.mediaItemId = mediaItemId;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}
