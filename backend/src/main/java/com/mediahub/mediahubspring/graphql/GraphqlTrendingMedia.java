package com.mediahub.mediahubspring.graphql;

public record GraphqlTrendingMedia(
        String externalId,
        String localMovieId,
        String title,
        String overview,
        String posterUrl,
        boolean savedLocally
) {}