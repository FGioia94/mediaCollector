package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ReviewUpdateRequest {

    @NotBlank
    private String text;

    @Min(value = 1, message = "Rating must be >= 1")
    @Max(value = 10, message = "Rating must be <= 10")
    private Integer rating;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}

