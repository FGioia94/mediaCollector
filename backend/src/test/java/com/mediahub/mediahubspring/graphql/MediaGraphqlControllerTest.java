package com.mediahub.mediahubspring.graphql;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.service.ExternalMediaService;
import com.mediahub.mediahubspring.service.MediaItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class MediaGraphqlControllerTest {

    @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

    @MockBean
    private MediaItemService mediaItemService;

    @MockBean
    private ExternalMediaService externalMediaService;

    @Test
    void discoverMedia_returnsMappedItems() {
        Movie movie = new Movie();
        movie.setTitle("Interstellar");
        movie.setDescription("Sci-fi");
        movie.setReleaseDate(LocalDate.of(2014, 11, 7));
        movie.setPosterUrl("poster-url");
        movie.setGenres(new HashSet<>());
        movie.setReviews(new HashSet<>());
        movie.setWatchLists(new HashSet<>());

        when(mediaItemService.discover("Inter", 1L, 2014, "movie", 7.5, "releaseDate", "desc"))
                .thenReturn(List.of(movie));

        assertGraphqlQuery("""
                query {
                  discoverMedia(title: "Inter", genreId: "1", year: 2014, type: "movie", minRating: 7.5, sortBy: "releaseDate", sortDir: "desc") {
                    title
                    releaseDate
                    posterUrl
                  }
                }
                """,
                "$.data.discoverMedia[0].title",
                "Interstellar",
                "$.data.discoverMedia[0].releaseDate",
                "2014-11-07");
    }

    @Test
    void trending_returnsExternalItems() {
        when(externalMediaService.getTrendingMovies()).thenReturn(List.of(
                new com.mediahub.mediahubspring.dto.TrendingMediaResponse(55L, 5L, "The Batman", "desc", "poster", true)
        ));

        assertGraphqlQuery("""
                query {
                  trending {
                    externalId
                    title
                    savedLocally
                  }
                }
                """,
                "$.data.trending[0].title",
                "The Batman",
                "$.data.trending[0].savedLocally",
                true);
    }

    @Test
    void statsByGenre_returnsCounts() {
        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[]{"Action", 4L});
        when(mediaItemService.countMediaByGenre()).thenReturn(rows);

        assertGraphqlQuery("""
                query {
                  statsByGenre {
                    genreName
                    mediaCount
                  }
                }
                """,
                "$.data.statsByGenre[0].genreName",
                "Action",
                "$.data.statsByGenre[0].mediaCount",
                4);
    }

    @Test
    void topReviewed_returnsItems() {
        Movie movie = new Movie();
        movie.setTitle("Inception");
        movie.setReleaseDate(LocalDate.of(2010, 7, 16));
        movie.setGenres(new HashSet<>());
        movie.setReviews(new HashSet<>());
        movie.setWatchLists(new HashSet<>());

        when(mediaItemService.findTopReviewed(10)).thenReturn(List.of(movie));

        assertGraphqlQuery("""
                query {
                  topReviewed {
                    title
                  }
                }
                """,
                "$.data.topReviewed[0].title",
                "Inception");
    }

    private void assertGraphqlQuery(String query, Object... pathValuePairs) {
        try {
            String payload = objectMapper.writeValueAsString(java.util.Map.of("query", query));

            var result = mockMvc.perform(post("/graphql")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            for (int index = 0; index < pathValuePairs.length; index += 2) {
                String path = (String) pathValuePairs[index];
                Object value = pathValuePairs[index + 1];
                result.andExpect(jsonPath(path).value(value));
            }
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}