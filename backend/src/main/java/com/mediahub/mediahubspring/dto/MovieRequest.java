package com.mediahub.mediahubspring.dto;

import com.mediahub.mediahubspring.model.Genre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.util.Set;

public class MovieRequest extends MediaItemRequest {

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be a positive number")
    private Integer duration;

    @NotBlank(message = "Director is required")
    private String director;

    @NotNull(message = "Budget is required")
    @PositiveOrZero(message = "Budget cannot be negative")
    private Long budget;

    public MovieRequest() {
    }

    public MovieRequest(String title,
                        String description,
                        LocalDate releaseDate,
                        String posterUrl,
                        Set<Long> genreIds,
                        Integer duration,
                        String director,
                        Long budget) {

        super(title, description, releaseDate, posterUrl, genreIds);
        this.duration = duration;
        this.director = director;
        this.budget = budget;
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
    // SETTERS

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public void setBudget(Long budget) {
        this.budget = budget;
    }
}
