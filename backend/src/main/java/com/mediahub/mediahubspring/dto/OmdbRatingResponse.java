package com.mediahub.mediahubspring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OmdbRatingResponse(
        @JsonProperty("imdbRating") String imdbRating,
        @JsonProperty("Metascore") String metascore,
        @JsonProperty("imdbID") String imdbId
) {}
