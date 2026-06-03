package com.mediahub.mediahubspring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;


@Entity
@Inheritance(strategy = InheritanceType.JOINED) // With JOINED, Hibernate creates a table per class
// Table1: Media Item - Only common fields
// Table2: Movie - Only film specific fields
// Table3: Tv Show - Only TV show specific fields

// When querying movie for instance, Hibernate will do
// SELECT *
// FROM media_item
// JOIN movie ON media_item.id = movie.id

public abstract class MediaItem {
    @Id // Used to define the table primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PostgreSQL will generate the ID automatically
    private Long id;

    @NotBlank
    @Column(length = 512)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
    private LocalDate releaseDate;

    @Column(length = 1024)
    private String posterUrl;


    @ManyToMany
    @JoinTable(
            name = "mediaitem_genres",
            joinColumns = @JoinColumn(name = "mediaitem_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();

    @OneToMany(mappedBy = "mediaItem")
    private Set<Review> reviews = new HashSet<>();

    private double averageRating;

    @OneToMany(mappedBy = "mediaItem")
    private Set<WatchList> watchLists = new HashSet<WatchList>();

    // Empty constructor used by Hibernate
    public MediaItem() {
    }

    // Constructor overloading for testing and manual creation of instances
    public MediaItem(String title,
                     String description,
                     LocalDate releaseDate,
                     String posterUrl,
                     Set<Genre> genres,
                     Set<Review> reviews,
                     Set<WatchList> watchLists) {
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.genres = genres;
        this.reviews = reviews;
        this.watchLists = watchLists;
    }

    // GETTERS
    public Long getId() {
        return this.id;
    }

    public String getTitle() {
        return this.title;
    }

    public String getDescription() {
        return this.description;
    }

    public LocalDate getReleaseDate() {
        return this.releaseDate;
    }

    public String getPosterUrl() {
        return this.posterUrl;
    }

    public Set<Genre> getGenres() {
        return this.genres;
    }

    public Set<Review> getReviews() {
        return this.reviews;
    }

    public Set<WatchList> getWatchLists() {
        return this.watchLists;
    }

    // SETTERS

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public void setGenres(Set<Genre> genres) {
        this.genres = genres;
    }

    public void setReviews(Set<Review> reviews) {
        this.reviews = reviews;
    }

    public void setWatchLists(Set<WatchList> watchLists) {
        this.watchLists = watchLists;
    }
}
