package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.GenreNotFoundException;
import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.repository.GenreRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GenreServiceImpl implements GenreService {

    private final GenreRepository repository;

    public GenreServiceImpl(GenreRepository repository) {
        this.repository = repository;
    }

    // -------------------------
    // CRUD
    // -------------------------

    @Override
    public Genre addGenre(Genre genre) {
        return repository.save(genre);
    }

    @Override
    public List<Genre> getAll() {
        return repository.findAll();
    }

    @Override
    public Genre get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new GenreNotFoundException(id));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new GenreNotFoundException(id);
        }
        repository.deleteById(id);
    }

    @Override
    public Genre update(Long id, Genre updates) {
        Genre existing = repository.findById(id)
                .orElseThrow(() -> new GenreNotFoundException(id));

        if (updates.getName() != null) {
            existing.setName(updates.getName());
        }

        return repository.save(existing);
    }


}

