package com.mediahub.mediahubspring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.List;

public record TmdbMovieDetails(
        Long id,
        String title,
        String overview,
        @JsonProperty("poster_path") String posterPath,
        @JsonProperty("imdb_id") String imdbId,
        @JsonProperty("release_date") LocalDate releaseDate,
        Integer runtime,
        Long budget,
        List<TmdbGenre> genres
) {}
