package com.mediahub.mediahubspring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "genres")
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(nullable = false)
    private final LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany(mappedBy = "genres")
    private Set<MediaItem> mediaItems = new HashSet<>();


    public Genre() {
    }

    public Genre(String name) {
        this.name = name;
    }

    // GETTERS
    public Long getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    // SETTERS
    public void setName(String name) {
        this.name = name;
    }
}
