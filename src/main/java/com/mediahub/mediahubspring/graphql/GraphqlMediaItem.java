package com.mediahub.mediahubspring.graphql;

import java.util.Set;

public record GraphqlMediaItem(
        String id,
        String title,
        String description,
        String releaseDate,
        String posterUrl,
        Set<String> genreIds,
        Set<String> reviewIds,
        Set<String> watchListIds
) {}