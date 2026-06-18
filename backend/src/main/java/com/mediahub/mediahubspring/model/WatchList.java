package com.mediahub.mediahubspring.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlists")
public class WatchList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "mediaitem_id")
    private MediaItem mediaItem;

    private final LocalDateTime addedAt = LocalDateTime.now();

    public WatchList(){}

    public WatchList(User user,
                     MediaItem mediaItem){
        this.user = user;
        this.mediaItem = mediaItem;
    }

    // GETTERS

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public MediaItem getMediaItem() {
        return mediaItem;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    // SETTERS


    public void setUser(User user) {
        this.user = user;
    }

    public void setMediaItem(MediaItem mediaItem) {
        this.mediaItem = mediaItem;
    }
}
