package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.MediaItemResponse;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.service.MediaItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/media")
public class MediaSearchController {

    private final MediaItemService service;

    public MediaSearchController(MediaItemService service) {
        this.service = service;
    }

    // ---------------------------------------------------------
    // 1. SEARCH BY TITLE
    // ---------------------------------------------------------
    @GetMapping("/search")
    public List<MediaItemResponse> searchByTitle(@RequestParam String title) {
        return service.searchByTitle(title)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // 2. FILTER BY GENRE
    // ---------------------------------------------------------
    @GetMapping("/by-genre/{genreId}")
    public List<MediaItemResponse> getByGenre(@PathVariable Long genreId) {
        return service.findByGenre(genreId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // 3. FILTER BY YEAR
    // ---------------------------------------------------------
    @GetMapping("/by-year/{year}")
    public List<MediaItemResponse> getByYear(@PathVariable int year) {
        return service.findByYear(year)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // 4. TOP REVIEWED
    // ---------------------------------------------------------
    @GetMapping("/top-reviewed")
    public List<MediaItemResponse> getTopReviewed(@RequestParam(defaultValue = "10") int limit) {
        return service.findTopReviewed(limit)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // 5. ADVANCED SEARCH
    // ---------------------------------------------------------
    @GetMapping("/advanced-search")
    public List<MediaItemResponse> advancedSearch(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long genreId,
            @RequestParam(required = false) Integer year
    ) {
        return service.advancedSearch(title, genreId, year)
                .stream()
                .map(this::toResponse)
                .toList();
    }

            @GetMapping("/by-type/{type}")
            public List<MediaItemResponse> getByType(@PathVariable String type) {
            return service.findByType(type)
                .stream()
                .map(this::toResponse)
                .toList();
            }

            @GetMapping("/best-rated-above")
            public List<MediaItemResponse> getBestRatedAbove(@RequestParam double minRating) {
            return service.findBestRatedAbove(minRating)
                .stream()
                .map(this::toResponse)
                .toList();
            }

            @GetMapping("/discover")
            public List<MediaItemResponse> discover(
                @RequestParam(required = false) String title,
                @RequestParam(required = false) Long genreId,
                @RequestParam(required = false) Integer year,
                @RequestParam(required = false) String type,
                @RequestParam(required = false) Double minRating,
                @RequestParam(defaultValue = "title") String sortBy,
                @RequestParam(defaultValue = "asc") String sortDir
            ) {
            return service.discover(title, genreId, year, type, minRating, sortBy, sortDir)
                .stream()
                .map(this::toResponse)
                .toList();
            }

    // ---------------------------------------------------------
    // 6. STATS: COUNT MEDIA BY GENRE
    // ---------------------------------------------------------
    @GetMapping("/stats/by-genre")
    public List<Object[]> countMediaByGenre() {
        return service.countMediaByGenre();
    }

    // ---------------------------------------------------------
    // 7. AVERAGE RATING OF A MEDIA ITEM
    // ---------------------------------------------------------
    @GetMapping("/{id}/average-rating")
    public Double getAverageRating(@PathVariable Long id) {
        return service.getAverageRating(id);
    }

    // ---------------------------------------------------------
    // MAPPING METHOD (Entity → DTO)
    // ---------------------------------------------------------
    private MediaItemResponse toResponse(MediaItem mediaItem) {
        return new MediaItemResponse(
                mediaItem.getId(),
                mediaItem.getTitle(),
                mediaItem.getDescription(),
                mediaItem.getReleaseDate(),
                mediaItem.getPosterUrl(),
                mediaItem.getGenres()
                        .stream()
                        .map(Genre::getId)
                        .collect(Collectors.toSet()),
                mediaItem.getReviews()
                        .stream()
                        .map(review -> review.getId())
                        .collect(Collectors.toSet()),
                mediaItem.getWatchLists()
                        .stream()
                        .map(watchList -> watchList.getId())
                        .collect(Collectors.toSet())
        );
    }
}
