package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.dto.EnrichedMediaDetails;
import com.mediahub.mediahubspring.dto.OmdbRatingResponse;
import com.mediahub.mediahubspring.dto.TmdbGenre;
import com.mediahub.mediahubspring.dto.TmdbSearchResponse;
import com.mediahub.mediahubspring.dto.TrendingMediaResponse;
import com.mediahub.mediahubspring.exception.ExternalApiException;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.repository.GenreRepository;
import com.mediahub.mediahubspring.repository.MovieRepository;
import org.springframework.stereotype.Service;
import com.mediahub.mediahubspring.service.TmdbClient;
import com.mediahub.mediahubspring.service.OmdbClient;
import com.mediahub.mediahubspring.dto.TmdbMovieDetails;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExternalMediaService {

    private final TmdbClient tmdb;
    private final OmdbClient omdb;
    private final GenreRepository genreRepository;
    private final MediaTitleGuard mediaTitleGuard;
    private MovieRepository movieRepository;

    public ExternalMediaService(TmdbClient tmdb,
                                OmdbClient omdb,
                                GenreRepository genreRepository,
                                MovieRepository movieRepository,
                                MediaTitleGuard mediaTitleGuard) {
        this.tmdb = tmdb;
        this.omdb = omdb;
        this.genreRepository = genreRepository;
        this.movieRepository = movieRepository;
        this.mediaTitleGuard = mediaTitleGuard;
    }

    public EnrichedMediaDetails getMovieDetails(Long tmdbId) {

        var tmdbDetails = tmdb.getMovieDetails(tmdbId);
        if (tmdbDetails == null) return null;

        OmdbRatingResponse omdbRatings = null;
        if (tmdbDetails.imdbId() != null) {
            omdbRatings = omdb.getRatings(tmdbDetails.imdbId());
        }

        return new EnrichedMediaDetails(
                tmdbDetails.title(),
                tmdbDetails.overview(),
                tmdbDetails.posterPath(),
                omdbRatings != null ? omdbRatings.imdbRating() : null,
                omdbRatings != null ? omdbRatings.metascore() : null
        );
    }

    public TmdbSearchResponse searchMovies(String query) {
        TmdbSearchResponse response = tmdb.searchMovies(query);
        return response;
    }

    public List<TrendingMediaResponse> getTrendingMovies() {
        TmdbSearchResponse trending = tmdb.getTrendingMovies();

        if (trending == null || trending.results() == null) {
            return List.of();
        }

        return trending.results().stream()
                .map(result -> {
                // Heuristic link: if we already have a similar title locally, expose its id.
                    Movie localMovie = movieRepository.findFirstByTitleContainingIgnoreCase(result.title())
                            .orElse(null);

                    return new TrendingMediaResponse(
                            result.id(),
                            localMovie != null ? localMovie.getId() : null,
                            result.title(),
                            result.overview(),
                            result.posterPath() != null ? "https://image.tmdb.org/t/p/w500" + result.posterPath() : null,
                            localMovie != null
                    );
                })
                .toList();
    }

    public Movie saveExternalMovie(Long tmdbId) {

        var tmdbDetails = tmdb.getMovieDetails(tmdbId);
        if (tmdbDetails == null) {
            throw new ExternalApiException("TMDB movie not found");
        }

        // Optional: OMDB ratings
        OmdbRatingResponse omdbRatings = null;
        if (tmdbDetails.imdbId() != null) {
            omdbRatings = omdb.getRatings(tmdbDetails.imdbId());
        }

        // Convert TMDB → MovieEntity
        Movie movie = new Movie();
        movie.setTitle(mediaTitleGuard.normalize(tmdbDetails.title()));
        movie.setDescription(tmdbDetails.overview());
        movie.setPosterUrl(tmdbDetails.posterPath() != null
            ? "https://image.tmdb.org/t/p/w500" + tmdbDetails.posterPath()
            : null);
        movie.setReleaseDate(tmdbDetails.releaseDate());
        movie.setDuration(tmdbDetails.runtime());
        movie.setDirector("Unknown");
        movie.setBudget(tmdbDetails.budget());

        // Convert TMDB genres → Set<Genre> dal DB
        Set<Genre> genres = mapGenresFromTmdb(tmdbDetails.genres());
        movie.setGenres(genres);

        // Reuse the same duplicate-title guard used by local create/update flows.
        mediaTitleGuard.assertUniqueForCreate(movie.getTitle());
        return movieRepository.save(movie);
    }


    private Set<Genre> mapGenresFromTmdb(List<TmdbGenre> tmdbGenres) {

        return tmdbGenres.stream()
                .map(g -> genreRepository.findByNameIgnoreCase(g.name())
                        .orElseGet(() -> {
                            // Auto-create unknown genres to keep import flow resilient.
                            Genre newGenre = new Genre(g.name());
                            return genreRepository.save(newGenre);
                        })
                )
                .collect(Collectors.toSet());
    }

}
