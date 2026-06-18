package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.MediaItemNotFoundException;
import com.mediahub.mediahubspring.model.TVShow;
import com.mediahub.mediahubspring.repository.TVShowRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TVShowServiceImpl implements TVShowService {

    private final TVShowRepository repository;
    private final MediaItemService mediaItemService;
    private final MediaTitleGuard mediaTitleGuard;

    public TVShowServiceImpl(TVShowRepository repository,
                             MediaItemService mediaItemService,
                             MediaTitleGuard mediaTitleGuard) {
        this.repository = repository;
        this.mediaItemService = mediaItemService;
        this.mediaTitleGuard = mediaTitleGuard;
    }

    @Override
    public TVShow addTVShow(TVShow tvShow) {
        tvShow.setTitle(mediaTitleGuard.normalize(tvShow.getTitle()));
        mediaTitleGuard.assertUniqueForCreate(tvShow.getTitle());
        return repository.save(tvShow);
    }

    @Override
    public TVShow get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new MediaItemNotFoundException(id));
    }

    @Override
    public List<TVShow> getAll() {
        return repository.findAll();
    }

    @Override
    public TVShow update(Long id, TVShow updates) {
        TVShow existing = get(id);

        mediaItemService.updateCommonFields(existing, updates);
        existing.setTitle(mediaTitleGuard.normalize(existing.getTitle()));
        mediaTitleGuard.assertUniqueForUpdate(id, existing.getTitle());

        if (updates.getSeasons() != null) existing.setSeasons(updates.getSeasons());
        if (updates.getEpisodes() != null) existing.setEpisodes(updates.getEpisodes());
        if (updates.getNetwork() != null) existing.setNetwork(updates.getNetwork());

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
