package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.GenreRequest;
import com.mediahub.mediahubspring.dto.GenreResponse;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.service.GenreService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/genres")
public class GenreController {

    private final GenreService service;

    public GenreController(GenreService service) {
        this.service = service;
    }

    @PostMapping
    public GenreResponse add(@Valid @RequestBody GenreRequest request) {

        Genre genre = new Genre();
        genre.setName(request.getName());

        Genre saved = service.addGenre(genre);

        return toResponse(saved);
    }

    @GetMapping
    public List<GenreResponse> getAll() {
        return service.getAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public GenreResponse get(@PathVariable Long id) {
        return toResponse(service.get(id));
    }

    @PutMapping("/{id}")
    public GenreResponse update(@PathVariable Long id,
                                @Valid @RequestBody GenreRequest request) {

        Genre existing = service.get(id);

        existing.setName(request.getName());

        Genre updated = service.update(id, existing);

        return toResponse(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private GenreResponse toResponse(Genre genre) {
        return new GenreResponse(
                genre.getId(),
                genre.getName(),
                genre.getCreatedAt()
        );
    }
}
