package com.mediahub.mediahubspring.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "movies")
public class Movie extends MediaItem {

    private Integer duration;
    private String director;
    private Long budget;

    public Movie() {
    }

    public Movie(int duration, String director, Long budget) {
        this.duration = duration;
        this.director = director;
        this.budget = budget;
    }

    public Movie(String title,
                 String description,
                 LocalDate releaseDate,
                 String posterUrl,
                 Set<Genre> genres,
                 Integer duration,
                 String director,
                 Long budget) {

        super(title, description, releaseDate, posterUrl, genres, null, null);
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
