package com.mediahub.mediahubspring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TmdbSearchResponse(
        int page,
        @JsonProperty("total_results") int totalResults,
        List<TmdbMovieSearchResult> results
) {}
