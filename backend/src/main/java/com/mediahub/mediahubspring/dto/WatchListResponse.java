package com.mediahub.mediahubspring.dto;

import java.time.LocalDateTime;

public class WatchListResponse {

    private Long id;

    private Long userId;

    private Long mediaItemId;

    private String mediaTitle;

    private LocalDateTime addedAt;

    public WatchListResponse() {
    }

    public WatchListResponse(
            Long id,
            Long userId,
            Long mediaItemId,
            String mediaTitle,
            LocalDateTime addedAt) {
        this.id = id;
        this.userId = userId;
        this.mediaItemId = mediaItemId;
        this.mediaTitle = mediaTitle;
        this.addedAt = addedAt;
    }

    // GETTERS


    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getMediaItemId() {
        return mediaItemId;
    }

    public String getMediaTitle() {
        return mediaTitle;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }
}