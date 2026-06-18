package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.dto.TmdbMovieDetails;
import com.mediahub.mediahubspring.dto.TmdbSearchResponse;
import com.mediahub.mediahubspring.exception.ExternalApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TmdbClient {

    private static final Logger log = LoggerFactory.getLogger(TmdbClient.class);

    // Injects the TMDB API key from application.properties or environment variables.
    @Value("${tmdb.api.key}")
    private String apiKey;

    // RestTemplate is used to perform HTTP requests to the TMDB API.
    private final RestTemplate rest = new RestTemplate();


    /**
     * Calls the TMDB "search movie" endpoint using the provided query string.
     *
     * @param query The movie title or keywords to search for.
     * @return A TmdbSearchResponse object containing the list of matching movies.
     *
     * The method builds the full TMDB URL, sends a GET request,
     * and automatically maps the JSON response into the TmdbSearchResponse DTO.
     */
    public TmdbSearchResponse searchMovies(String query) {
        String url = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&query=" + query;
        try {
            return rest.getForObject(url, TmdbSearchResponse.class);

        } catch (Exception ex) {
            log.error("[TMDB] Error calling searchMovies(): {}", ex.getMessage());
            throw new ExternalApiException("TMDB search request failed");
        }
    }

    public TmdbSearchResponse getTrendingMovies() {
        String url = "https://api.themoviedb.org/3/movie/popular?api_key=" + apiKey;

        try {
            return rest.getForObject(url, TmdbSearchResponse.class);
        } catch (Exception ex) {
            log.error("[TMDB] Error calling getTrendingMovies(): {}", ex.getMessage());
            throw new ExternalApiException("TMDB trending request failed");
        }
    }


    // Calls TMDB's movie details endpoint to retrieve full information
    // about a movie, including the IMDb ID (required for OMDB).
    public TmdbMovieDetails getMovieDetails(Long id) {
        String url = "https://api.themoviedb.org/3/movie/" + id + "?api_key=" + apiKey;

        try {
            return rest.getForObject(url, TmdbMovieDetails.class);
        } catch (Exception ex) {
            log.error("[TMDB] Error calling getMovieDetails(): {}", ex.getMessage());
            throw new ExternalApiException("TMDB movie details request failed");
        }
    }

}
