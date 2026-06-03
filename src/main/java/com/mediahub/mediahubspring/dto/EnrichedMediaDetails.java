package com.mediahub.mediahubspring.dto;

public record EnrichedMediaDetails(
        String title,
        String overview,
        String posterUrl,
        String imdbRating,
        String metascore
) {}
