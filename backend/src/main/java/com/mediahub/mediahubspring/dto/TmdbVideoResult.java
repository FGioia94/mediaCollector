package com.mediahub.mediahubspring.dto;

public record TmdbVideoResult(
        String key,
        String name,
        String site,
        String type,
        Boolean official
) {}
