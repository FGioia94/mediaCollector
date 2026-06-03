package com.mediahub.mediahubspring.dto;

import java.time.LocalDate;
import java.util.Set;

public class MovieResponse extends MediaItemResponse {

    private Integer duration;
    private String director;
    private Long budget;

    public MovieResponse() {
    }

    public MovieResponse(Long id,
                         String title,
                         String description,
                         LocalDate releaseDate,
                         String posterUrl,
                         Set<Long> genreIds,
                         Set<Long> reviewIds,
                         Set<Long> watchListIds,
                         Integer duration,
                         String director,
                         Long budget) {
        super(id, title, description, releaseDate, posterUrl, genreIds, reviewIds, watchListIds);
        this.duration = duration;
        this.director = director;
        this.budget = budget;
    }

    public <R> MovieResponse(Long id, String title, String description, LocalDate releaseDate, String posterUrl, String posterUrl1, R collect) {
    }

    // GETTERS

    public Integer getDuration() {
        return this.duration;
    }

    public String getDirector() {
        return this.director;
    }

    public Long getBudget() {
        return this.budget;
    }
}
