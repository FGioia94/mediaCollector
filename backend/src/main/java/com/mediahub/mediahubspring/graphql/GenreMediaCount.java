package com.mediahub.mediahubspring.graphql;

public record GenreMediaCount(
        String genreName,
        int mediaCount
) {}