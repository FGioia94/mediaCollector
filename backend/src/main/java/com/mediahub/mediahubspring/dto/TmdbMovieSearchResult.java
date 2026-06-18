package com.mediahub.mediahubspring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbMovieSearchResult(
        Long id,
        String title,
        String overview,
        // @JsonProperty is needed when the name of the fields that come from
        // the API are not the same of the DTO
        @JsonProperty("poster_path") String posterPath,
        @JsonProperty("release_date") String releaseDate
) {}
