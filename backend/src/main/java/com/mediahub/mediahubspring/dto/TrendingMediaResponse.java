package com.mediahub.mediahubspring.dto;

public record TrendingMediaResponse(
        Long externalId,
        Long localMovieId,
        String title,
        String overview,
        String posterUrl,
        boolean savedLocally
) {}