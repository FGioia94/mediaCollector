package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.repository.MediaItemRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

@Component
public class MediaTitleGuard {

    private final MediaItemRepository mediaItemRepository;

    public MediaTitleGuard(MediaItemRepository mediaItemRepository) {
        this.mediaItemRepository = mediaItemRepository;
    }

    public String normalize(String title) {
        // Keep title checks case-insensitive and trim accidental spaces.
        return title == null ? null : title.trim();
    }

    public void assertUniqueForCreate(String title) {
        String normalizedTitle = normalize(title);
        if (normalizedTitle != null && mediaItemRepository.existsByTitleIgnoreCase(normalizedTitle)) {
            throw new DuplicateKeyException("Media item already exists for title: " + normalizedTitle);
        }
    }

    public void assertUniqueForUpdate(Long id, String title) {
        // Exclude the current entity id to avoid false positives on unchanged title.
        String normalizedTitle = normalize(title);
        if (normalizedTitle != null && mediaItemRepository.existsByTitleIgnoreCaseAndIdNot(normalizedTitle, id)) {
            throw new DuplicateKeyException("Media item already exists for title: " + normalizedTitle);
        }
    }
}