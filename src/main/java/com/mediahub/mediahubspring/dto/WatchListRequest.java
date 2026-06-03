package com.mediahub.mediahubspring.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class WatchListRequest {

    @NotNull(message = "User id is required")
    @Positive
    private Long userId;

    @NotNull(message = "MediaItem id is required")
    @Positive
    private Long mediaItemId;

    public WatchListRequest(){}

    public WatchListRequest(Long userId,
                     Long mediaItemId){
        this.userId = userId;
        this.mediaItemId = mediaItemId;
    }

    // GETTERS

    public Long getUserId() {
        return userId;
    }

    public Long getMediaItemId() {
        return mediaItemId;
    }

    // SETTERS


    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setMediaItemId(Long mediaItemId) {
        this.mediaItemId = mediaItemId;
    }
}
