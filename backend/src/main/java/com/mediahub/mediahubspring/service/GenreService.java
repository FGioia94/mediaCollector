package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Genre;

import java.util.List;

public interface GenreService {

    public Genre addGenre(Genre genre);

    public List<Genre> getAll();

    public Genre get(Long id);

    public void delete(Long id);

    public Genre update(Long id, Genre updates);
}
