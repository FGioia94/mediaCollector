package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.Set;

public class MediaItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private LocalDate releaseDate;
    private String posterUrl;

    // IDs dei generi
    private Set<Long> genreIds;

    public MediaItemRequest() {
    }

    public MediaItemRequest(String title,
                            String description,
                            LocalDate releaseDate,
                            String posterUrl,
                            Set<Long> genreIds) {
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.genreIds = genreIds;
    }

    public String getTitle() {
        return title;
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

    public void setGenreIds(Set<Long> genreIds) {
        this.genreIds = genreIds;
    }
}
