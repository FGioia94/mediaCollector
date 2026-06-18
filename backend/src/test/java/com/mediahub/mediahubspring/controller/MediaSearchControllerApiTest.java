package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.model.TVShow;
import com.mediahub.mediahubspring.security.JwtAuthenticationFilter;
import com.mediahub.mediahubspring.service.MediaItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = MediaSearchController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    }
)
@AutoConfigureMockMvc(addFilters = false)
class MediaSearchControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MediaItemService mediaItemService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getByType_returnsFilteredMedia() throws Exception {
        Movie movie = buildMovie(1L, "Inception", LocalDate.of(2010, 7, 16));
        when(mediaItemService.findByType("movie")).thenReturn(List.of(movie));

        mockMvc.perform(get("/media/by-type/movie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Inception"));
    }

    @Test
    void bestRatedAbove_returnsItems() throws Exception {
        TVShow show = buildTvShow(2L, "Dark", LocalDate.of(2017, 12, 1));
        when(mediaItemService.findBestRatedAbove(8.0)).thenReturn(List.of(show));

        mockMvc.perform(get("/media/best-rated-above").param("minRating", "8.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2L))
                .andExpect(jsonPath("$[0].title").value("Dark"));
    }

    @Test
    void discover_supportsSortingAndFilters() throws Exception {
        Movie movie = buildMovie(3L, "Interstellar", LocalDate.of(2014, 11, 7));

        when(mediaItemService.discover("Inter", 1L, 2014, "movie", 7.5, "releaseDate", "desc"))
                .thenReturn(List.of(movie));

        mockMvc.perform(get("/media/discover")
                        .param("title", "Inter")
                        .param("genreId", "1")
                        .param("year", "2014")
                        .param("type", "movie")
                        .param("minRating", "7.5")
                        .param("sortBy", "releaseDate")
                        .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(3L))
                .andExpect(jsonPath("$[0].title").value("Interstellar"));
    }

    private Movie buildMovie(Long id, String title, LocalDate date) {
        Movie movie = new Movie();
        movie.setTitle(title);
        movie.setReleaseDate(date);
        movie.setDescription("desc");
        movie.setPosterUrl("poster");
        movie.setGenres(new HashSet<>());
        movie.setReviews(new HashSet<>());
        movie.setWatchLists(new HashSet<>());

        try {
            var idField = movie.getClass().getSuperclass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(movie, id);
        } catch (Exception ignored) {
        }

        return movie;
    }

    private TVShow buildTvShow(Long id, String title, LocalDate date) {
        TVShow show = new TVShow();
        show.setTitle(title);
        show.setReleaseDate(date);
        show.setDescription("desc");
        show.setPosterUrl("poster");
        show.setGenres(new HashSet<>());
        show.setReviews(new HashSet<>());
        show.setWatchLists(new HashSet<>());

        try {
            var idField = show.getClass().getSuperclass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(show, id);
        } catch (Exception ignored) {
        }

        return show;
    }
}
