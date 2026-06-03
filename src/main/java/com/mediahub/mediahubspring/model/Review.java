package com.mediahub.mediahubspring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    @NotBlank
    private String text;

    @ManyToOne()
    @JoinColumn(name = "mediaitem_id")
    private MediaItem mediaItem;

    @Column(nullable = false)
    private final LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private Integer rating;

    public Review() {
    }

    public Review(User author,
                  String text,
                  MediaItem mediaItem,
                  Integer rating) {
        this.author = author;
        this.text = text;
        this.mediaItem = mediaItem;
        this.rating = rating;
    }

    // GETTERS
    public Long getId() {
        return this.id;
    }

    public User getAuthor() {
        return this.author;
    }

    public String getText() {
        return this.text;
    }

    public MediaItem getMediaItem() {
        return this.mediaItem;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public Integer getRating() {
        return rating;
    }

    // SETTERS

    public void setAuthor(User user) {
        this.author = user;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setMediaItem(MediaItem mediaItem) {
        this.mediaItem = mediaItem;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}
