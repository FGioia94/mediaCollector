package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.model.TVShow;
import com.mediahub.mediahubspring.repository.MediaItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediaItemServiceImplTest {

    @Mock
    private MediaItemRepository repository;

    @InjectMocks
    private MediaItemServiceImpl service;

    @Test
    void findByType_shouldReturnOnlyMovies() {
        Movie movie = new Movie();
        TVShow show = new TVShow();

        when(repository.findAllMovies()).thenReturn(List.of(movie));
        when(repository.findAllTvShows()).thenReturn(List.of(show));

        List<MediaItem> movies = service.findByType("movie");
        List<MediaItem> tvShows = service.findByType("tv");

        assertEquals(1, movies.size());
        assertTrue(movies.get(0) instanceof Movie);
        assertEquals(1, tvShows.size());
        assertTrue(tvShows.get(0) instanceof TVShow);
    }

    @Test
    void discover_shouldFilterByMinRatingAndSortByReleaseDateDesc() {
        Movie older = new Movie();
        older.setTitle("Older");
        older.setReleaseDate(LocalDate.of(2020, 1, 1));

        Movie newer = new Movie();
        newer.setTitle("Newer");
        newer.setReleaseDate(LocalDate.of(2023, 1, 1));

        when(repository.advancedSearch(null, null, null)).thenReturn(List.of(older, newer));
        when(repository.getAverageRating(any())).thenReturn(8.5);

        List<MediaItem> result = service.discover(
                null,
                null,
                null,
                "movie",
                8.0,
                "releaseDate",
                "desc"
        );

        assertEquals(2, result.size());
        assertEquals("Newer", result.get(0).getTitle());
        assertEquals("Older", result.get(1).getTitle());
    }
}
