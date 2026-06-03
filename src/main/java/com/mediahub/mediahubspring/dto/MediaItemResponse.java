package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.Set;

public class MediaItemResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDate releaseDate;
    private String posterUrl;
    private Set<Long> genreIds;
    private Set<Long> reviewIds;
    private Set<Long> watchListIds;


    // Empty constructor is ALWAYS required for Spring
    public MediaItemResponse(){}

    // Constructor overloading
    public MediaItemResponse(Long id,
                             String title,
                             String description,
                             LocalDate releaseDate,
                             String posterUrl,
                             Set<Long> genreIds,
                             Set<Long> reviewIds,
                             Set<Long> watchListIds){
        this.id = id;
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.genreIds = genreIds;
        this.reviewIds = reviewIds;
        this.watchListIds = watchListIds;
    }

    // GETTERS
    public Long getId(){
        return this.id;
    };

    public String getTitle(){
        return this.title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public Set<Long> getGenreIds() {
        return genreIds;
    }

    public Set<Long> getReviewIds() {
        return reviewIds;
    }

    public Set<Long> getWatchListIds() {
        return watchListIds;
    }

    // No need for SETTERS for RESPONSE DTO
}
