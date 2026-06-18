package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.MovieRequest;
import com.mediahub.mediahubspring.dto.MovieResponse;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.service.GenreService;
import com.mediahub.mediahubspring.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService service;
    private final GenreService genreService;

    public MovieController(MovieService service, GenreService genreService) {
        this.service = service;
        this.genreService = genreService;
    }

    @PostMapping
    public MovieResponse add(@Valid @RequestBody MovieRequest request) {

        Set<Genre> genres = request.getGenreIds()
                .stream()
                .map(genreService::get)
                .collect(Collectors.toSet());

        Movie movie = new Movie();
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setGenres(genres);
        movie.setDuration(request.getDuration());
        movie.setDirector(request.getDirector());
        movie.setBudget(request.getBudget());

        Movie saved = service.addMovie(movie);

        return toResponse(saved);
    }


    @GetMapping("/all")
    public List<MovieResponse> getAll() {
        return service.getAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public MovieResponse get(@PathVariable Long id) {
        return toResponse(service.get(id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}")
    public MovieResponse update(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {

        Movie existing = service.get(id);

        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setReleaseDate(request.getReleaseDate());
        existing.setPosterUrl(request.getPosterUrl());

        Set<Genre> genres = request.getGenreIds()
                .stream()
                .map(genreService::get)
                .collect(Collectors.toSet());

        existing.setGenres(genres);

        existing.setDuration(request.getDuration());
        existing.setDirector(request.getDirector());
        existing.setBudget(request.getBudget());

        Movie updated = service.update(id, existing);

        return toResponse(updated);
    }

    private MovieResponse toResponse(Movie movie) {
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getReleaseDate(),
                movie.getPosterUrl(),
                movie.getGenres()
                        .stream()
                        .map(Genre::getId)
                        .collect(Collectors.toSet()),
                movie.getReviews()
                        .stream()
                        .map(review -> review.getId())
                        .collect(Collectors.toSet()),
                movie.getWatchLists()
                        .stream()
                        .map(watchList -> watchList.getId())
                        .collect(Collectors.toSet()),
                movie.getDuration(),
                movie.getDirector(),
                movie.getBudget()
        );
    }
}
