package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.EnrichedMediaDetails;
import com.mediahub.mediahubspring.dto.MovieResponse;
import com.mediahub.mediahubspring.dto.TmdbSearchResponse;
import com.mediahub.mediahubspring.dto.TrendingMediaResponse;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.service.ExternalMediaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/external")
public class ExternalMediaController {

    private final ExternalMediaService service;

    // Injects the ExternalMediaService which combines TMDB and OMDB data.
    public ExternalMediaController(ExternalMediaService service) {
        this.service = service;
    }

    @GetMapping("/movie/{id}")
    public EnrichedMediaDetails getMovie(@PathVariable Long id) {
        return service.getMovieDetails(id);
    }

    @GetMapping("/search")
    public TmdbSearchResponse searchMovies(@RequestParam String query) {
        return service.searchMovies(query);
    }

    @GetMapping("/trending")
    public List<TrendingMediaResponse> trendingMovies() {
        return service.getTrendingMovies();
    }

    @PostMapping("/movie/{id}/save")
    public MovieResponse saveExternalMovie(@PathVariable Long id) {
        Movie saved = service.saveExternalMovie(id);
        return new MovieResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getReleaseDate(),
                saved.getPosterUrl(),
                saved.getGenres()
                        .stream()
                        .map(Genre::getId)
                        .collect(Collectors.toSet()),
                saved.getReviews()
                        .stream()
                        .map(review -> review.getId())
                        .collect(Collectors.toSet()),
                saved.getWatchLists()
                        .stream()
                        .map(watchList -> watchList.getId())
                        .collect(Collectors.toSet()),
                saved.getDuration(),
                saved.getDirector(),
                saved.getBudget());
    }

}
