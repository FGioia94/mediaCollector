package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.TVShowRequest;
import com.mediahub.mediahubspring.dto.TVShowResponse;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.TVShow;
import com.mediahub.mediahubspring.service.GenreService;
import com.mediahub.mediahubspring.service.TVShowService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tvshows")
public class TVShowController {

    private final TVShowService service;
    private final GenreService genreService;

    public TVShowController(TVShowService service, GenreService genreService) {
        this.service = service;
        this.genreService = genreService;
    }

    @PostMapping
    public TVShowResponse add(@Valid @RequestBody TVShowRequest request) {

        Set<Genre> genres = request.getGenreIds()
                .stream()
                .map(genreService::get)
                .collect(Collectors.toSet());

        TVShow tv = new TVShow();
        tv.setTitle(request.getTitle());
        tv.setDescription(request.getDescription());
        tv.setReleaseDate(request.getReleaseDate());
        tv.setPosterUrl(request.getPosterUrl());
        tv.setGenres(genres);
        tv.setSeasons(request.getSeasons());
        tv.setEpisodes(request.getEpisodes());
        tv.setNetwork(request.getNetwork());

        TVShow saved = service.addTVShow(tv);

        return toResponse(saved);
    }


    @GetMapping("/all")
    public List<TVShowResponse> getAll() {
        return service.getAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public TVShowResponse get(@PathVariable Long id) {
        return toResponse(service.get(id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}")
    public TVShowResponse update(@PathVariable Long id, @Valid @RequestBody TVShowRequest request) {

        TVShow existing = service.get(id);

        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setReleaseDate(request.getReleaseDate());
        existing.setPosterUrl(request.getPosterUrl());

        Set<Genre> genres = request.getGenreIds()
                .stream()
                .map(genreService::get)
                .collect(Collectors.toSet());

        existing.setGenres(genres);

        existing.setSeasons(request.getSeasons());
        existing.setEpisodes(request.getEpisodes());
        existing.setNetwork(request.getNetwork());

        TVShow updated = service.update(id, existing);

        return toResponse(updated);
    }

    private TVShowResponse toResponse(TVShow tv) {
        return new TVShowResponse(
                tv.getId(),
                tv.getTitle(),
                tv.getDescription(),
                tv.getReleaseDate(),
                tv.getPosterUrl(),
                tv.getGenres()
                        .stream()
                        .map(Genre::getId)
                        .collect(Collectors.toSet()),
                tv.getReviews()
                        .stream()
                        .map(review -> review.getId())
                        .collect(Collectors.toSet()),
                tv.getWatchLists()
                        .stream()
                        .map(watchList -> watchList.getId())
                        .collect(Collectors.toSet()),
                tv.getSeasons(),
                tv.getEpisodes(),
                tv.getNetwork()
        );
    }
}
