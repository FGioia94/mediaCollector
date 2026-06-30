package com.mediahub.mediahubspring.dto;

public record ExternalTrailerResponse(
        String provider,
        String key,
        String embedUrl
) {}
