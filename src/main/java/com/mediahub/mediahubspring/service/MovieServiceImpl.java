package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.MediaItemNotFoundException;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository repository;
    private final MediaItemService mediaItemService;
    private final MediaTitleGuard mediaTitleGuard;

    public MovieServiceImpl(MovieRepository repository,
                            MediaItemService mediaItemService,
                            MediaTitleGuard mediaTitleGuard) {
        this.repository = repository;
        this.mediaItemService = mediaItemService;
        this.mediaTitleGuard = mediaTitleGuard;
    }

    @Override
    public Movie addMovie(Movie movie) {
        movie.setTitle(mediaTitleGuard.normalize(movie.getTitle()));
        mediaTitleGuard.assertUniqueForCreate(movie.getTitle());
        return repository.save(movie);
    }

    @Override
    public Movie get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new MediaItemNotFoundException(id));
    }

    @Override
    public List<Movie> getAll() {
        return repository.findAll();
    }

    @Override
    public Movie update(Long id, Movie updates) {
        Movie existing = get(id);

        mediaItemService.updateCommonFields(existing, updates);
        existing.setTitle(mediaTitleGuard.normalize(existing.getTitle()));
        mediaTitleGuard.assertUniqueForUpdate(id, existing.getTitle());

        if (updates.getDirector() != null) existing.setDirector(updates.getDirector());
        if (updates.getDuration() != null) existing.setDuration(updates.getDuration());
        if (updates.getBudget() != null) existing.setBudget(updates.getBudget());

        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new MediaItemNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
