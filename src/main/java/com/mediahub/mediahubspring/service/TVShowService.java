package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.TVShow;

import java.util.List;

public interface TVShowService {
    TVShow addTVShow(TVShow tvShow);
    TVShow get(Long id);
    List<TVShow> getAll();
    TVShow update(Long id, TVShow updates);
    void delete(Long id);
}
