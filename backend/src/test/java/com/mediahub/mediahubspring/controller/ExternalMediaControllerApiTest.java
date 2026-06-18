package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.EnrichedMediaDetails;
import com.mediahub.mediahubspring.dto.TmdbMovieSearchResult;
import com.mediahub.mediahubspring.dto.TmdbSearchResponse;
import com.mediahub.mediahubspring.dto.TrendingMediaResponse;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.security.JwtAuthenticationFilter;
import com.mediahub.mediahubspring.service.ExternalMediaService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ExternalMediaController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
class ExternalMediaControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExternalMediaService externalMediaService;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void getMovie_returnsEnrichedDetails() throws Exception {
        EnrichedMediaDetails details = new EnrichedMediaDetails(
                "Dune",
                "Sci-fi",
                "/poster.jpg",
                "8.1",
                "74"
        );

        when(externalMediaService.getMovieDetails(100L)).thenReturn(details);

        mockMvc.perform(get("/external/movie/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Dune"))
                .andExpect(jsonPath("$.imdbRating").value("8.1"));
    }

    @Test
    void search_returnsTmdbSearchPayload() throws Exception {
        TmdbSearchResponse response = new TmdbSearchResponse(
                1,
                1,
                List.of(new TmdbMovieSearchResult(10L, "Avatar", "Epic", "/avatar.jpg", "2009-12-18"))
        );

        when(externalMediaService.searchMovies("avatar")).thenReturn(response);

        mockMvc.perform(get("/external/search").param("query", "avatar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.results[0].title").value("Avatar"));
    }

    @Test
    void trending_returnsCombinedTrendingItems() throws Exception {
        List<TrendingMediaResponse> response = List.of(
                new TrendingMediaResponse(55L, 5L, "The Batman", "desc", "poster", true)
        );

        when(externalMediaService.getTrendingMovies()).thenReturn(response);

        mockMvc.perform(get("/external/trending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].externalId").value(55L))
                .andExpect(jsonPath("$[0].savedLocally").value(true));
    }

    @Test
    void saveExternalMovie_returnsMappedMovieResponse() throws Exception {
        Movie movie = new Movie();
        movie.setTitle("Arrival");
        movie.setDescription("Aliens arrive");
        movie.setReleaseDate(LocalDate.of(2016, 11, 11));
        movie.setPosterUrl("poster-url");
        movie.setDuration(116);
        movie.setDirector("Denis Villeneuve");
        movie.setBudget(47000000L);
        movie.setGenres(new HashSet<>());
        movie.setReviews(new HashSet<>());
        movie.setWatchLists(new HashSet<>());

        try {
            var idField = movie.getClass().getSuperclass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(movie, 77L);
        } catch (Exception ignored) {
        }

        when(externalMediaService.saveExternalMovie(500L)).thenReturn(movie);

        mockMvc.perform(post("/external/movie/500/save"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(77L))
                .andExpect(jsonPath("$.title").value("Arrival"))
                .andExpect(jsonPath("$.duration").value(116));
    }
}
