package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Movie;

import java.util.List;

public interface MovieService {
    Movie addMovie(Movie movie);
    Movie get(Long id);
    List<Movie> getAll();
    Movie update(Long id, Movie updates);
    void delete(Long id);
}
