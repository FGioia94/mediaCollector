package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.MediaItemNotFoundException;
import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.repository.MediaItemRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class MediaItemServiceImpl implements MediaItemService {

    private final MediaItemRepository repository;
    private final MediaTitleGuard mediaTitleGuard;

    public MediaItemServiceImpl(MediaItemRepository repository, MediaTitleGuard mediaTitleGuard) {
        this.repository = repository;
        this.mediaTitleGuard = mediaTitleGuard;
    }

    // -------------------------
    // CRUD
    // -------------------------

    @Override
    public MediaItem addMediaItem(MediaItem item) {
        // Normalize before uniqueness checks to avoid duplicates with extra spaces/case differences.
        item.setTitle(mediaTitleGuard.normalize(item.getTitle()));
        mediaTitleGuard.assertUniqueForCreate(item.getTitle());
        return repository.save(item);
    }

    @Override
    public List<MediaItem> getAll() {
        return repository.findAll();
    }

    @Override
    public MediaItem get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new MediaItemNotFoundException(id));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new MediaItemNotFoundException(id);
        }
        repository.deleteById(id);
    }

    @Override
    public MediaItem update(Long id, MediaItem updates) {
        MediaItem existing = get(id);
        updateCommonFields(existing, updates);
        existing.setTitle(mediaTitleGuard.normalize(existing.getTitle()));
        mediaTitleGuard.assertUniqueForUpdate(id, existing.getTitle());
        return repository.save(existing);
    }

    @Override
    public void updateCommonFields(MediaItem existing, MediaItem updates) {
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getReleaseDate() != null) existing.setReleaseDate(updates.getReleaseDate());
        if (updates.getPosterUrl() != null) existing.setPosterUrl(updates.getPosterUrl());
        if (updates.getGenres() != null) existing.setGenres(updates.getGenres());
    }

    // -------------------------
    // ADVANCED QUERIES
    // -------------------------

    @Override
    public List<MediaItem> searchByTitle(String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public List<MediaItem> findByGenre(Long genreId) {
        return repository.findByGenres_Id(genreId);
    }

    @Override
    public List<MediaItem> findByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return repository.findByReleaseDateBetween(start, end);
    }

    @Override
    public List<MediaItem> findTopReviewed(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return repository.findTopReviewed(pageable);
    }

    @Override
    public List<MediaItem> advancedSearch(String title, Long genreId, Integer year) {
        return repository.advancedSearch(title, genreId, year);
    }

    @Override
    public List<MediaItem> findByType(String type) {
        if (type == null) {
            return repository.findAll();
        }

        String normalizedType = type.toLowerCase(Locale.ROOT);
        return switch (normalizedType) {
            case "movie", "movies" -> repository.findAllMovies();
            case "tv", "tvshow", "tvshows" -> repository.findAllTvShows();
            default -> throw new IllegalArgumentException("Unsupported media type: " + type);
        };
    }

    @Override
    public List<MediaItem> findBestRatedAbove(double minRating) {
        return repository.findAll().stream()
                .filter(item -> {
                    Double avg = repository.getAverageRating(item.getId());
                    return avg != null && avg >= minRating;
                })
                .toList();
    }

    @Override
    public List<MediaItem> discover(String title,
                                    Long genreId,
                                    Integer year,
                                    String type,
                                    Double minRating,
                                    String sortBy,
                                    String sortDir) {

        // Start with DB-side filters, then apply type/rating/sort refinements in memory.
        String normalizedTitle = (title == null || title.isBlank()) ? null : title.trim();
        List<MediaItem> base = repository.advancedSearch(normalizedTitle, genreId, year);

        if (type != null && !type.isBlank()) {
            String normalizedType = type.toLowerCase(Locale.ROOT);
            base = base.stream()
                    .filter(item -> switch (normalizedType) {
                        case "movie", "movies" -> item instanceof com.mediahub.mediahubspring.model.Movie;
                        case "tv", "tvshow", "tvshows" -> item instanceof com.mediahub.mediahubspring.model.TVShow;
                        default -> throw new IllegalArgumentException("Unsupported media type: " + type);
                    })
                    .toList();
        }

        if (minRating != null) {
            final double threshold = minRating;
            base = base.stream()
                    .filter(item -> {
                        Double avg = repository.getAverageRating(item.getId());
                        return avg != null && avg >= threshold;
                    })
                    .toList();
        }

        Comparator<MediaItem> comparator = buildSortComparator(sortBy);
        if (sortDir != null && sortDir.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        return base.stream()
                .sorted(comparator)
                .toList();
    }

    private Comparator<MediaItem> buildSortComparator(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Comparator.comparing(MediaItem::getTitle, String.CASE_INSENSITIVE_ORDER);
        }

        return switch (sortBy.toLowerCase(Locale.ROOT)) {
            case "releasedate", "release_date", "year" ->
                    Comparator.comparing(MediaItem::getReleaseDate,
                            Comparator.nullsLast(Comparator.naturalOrder()));
            case "rating", "averagerating", "average_rating" ->
                    Comparator.comparing(item -> {
                        Double avg = repository.getAverageRating(item.getId());
                        return avg != null ? avg : 0.0;
                    });
            case "reviewcount", "review_count", "reviews" ->
                    Comparator.comparing(item -> item.getReviews() != null ? item.getReviews().size() : 0);
            case "title" -> Comparator.comparing(MediaItem::getTitle, String.CASE_INSENSITIVE_ORDER);
            default -> throw new IllegalArgumentException("Unsupported sortBy value: " + sortBy);
        };
    }

    @Override
    public List<Object[]> countMediaByGenre() {
        return repository.countMediaByGenre();
    }

    @Override
    public Double getAverageRating(Long mediaId) {
        return repository.getAverageRating(mediaId);
    }
}
