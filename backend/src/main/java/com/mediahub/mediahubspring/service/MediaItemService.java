package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.MediaItem;

import java.util.List;

public interface MediaItemService {
    MediaItem addMediaItem(MediaItem item);
    List<MediaItem> getAll();
    MediaItem get(Long id);
    void delete(Long id);
    MediaItem update(Long id, MediaItem updates);

    void updateCommonFields(MediaItem existing, MediaItem updates);

    public List<MediaItem> searchByTitle(String title);

    List<MediaItem> findByGenre(Long genreId);

    List<MediaItem> findByYear(int year);

    List<MediaItem> findTopReviewed(int limit);

    List<MediaItem> advancedSearch(String title, Long genreId, Integer year);

    List<MediaItem> findByType(String type);

    List<MediaItem> findBestRatedAbove(double minRating);

    List<MediaItem> discover(String title,
                             Long genreId,
                             Integer year,
                             String type,
                             Double minRating,
                             String sortBy,
                             String sortDir);

    List<Object[]> countMediaByGenre();

    Double getAverageRating(Long mediaId);
}
