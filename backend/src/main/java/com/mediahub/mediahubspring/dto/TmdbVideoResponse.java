package com.mediahub.mediahubspring.dto;

import java.util.List;

public record TmdbVideoResponse(
        Long id,
        List<TmdbVideoResult> results
) {}
