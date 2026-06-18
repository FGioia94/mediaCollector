package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.WatchlistNotFoundException;
import com.mediahub.mediahubspring.model.WatchList;
import com.mediahub.mediahubspring.repository.WatchListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WatchListServiceImpl implements WatchListService {

    private final WatchListRepository repository;

    public WatchListServiceImpl(WatchListRepository repository) {
        this.repository = repository;
    }

    // -------------------------
    // CRUD
    // -------------------------

    @Override
    public WatchList addWatchList(WatchList watchList) {
        Long userId = watchList.getUser().getId();
        Long mediaItemId = watchList.getMediaItem().getId();

        if (repository.existsByUser_IdAndMediaItem_Id(userId, mediaItemId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This media item is already in the user's watchlist"
            );
        }

        return repository.save(watchList);
    }

    @Override
    public List<WatchList> getAll() {
        return repository.findAll();
    }

    @Override
    public WatchList get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new WatchlistNotFoundException(id));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new WatchlistNotFoundException(id);
        }
        repository.deleteById(id);
    }

    @Override
    public WatchList update(Long id, WatchList updates) {
        WatchList existing = repository.findById(id)
                .orElseThrow(() -> new WatchlistNotFoundException(id));

        if (updates.getUser() != null) {
            existing.setUser(updates.getUser());
        }
        if (updates.getMediaItem() != null) {
            existing.setMediaItem(updates.getMediaItem());
        }

        return repository.save(existing);
    }

    // -------------------------
    // ADVANCED QUERIES
    // -------------------------

    @Override
    public List<WatchList> getByUserId(Long userId) {
        return repository.findByUser_Id(userId);
    }

    @Override
    public boolean exists(Long userId, Long mediaItemId) {
        return repository.existsByUser_IdAndMediaItem_Id(userId, mediaItemId);
    }

    @Override
    public List<WatchList> getByMediaItem(Long mediaItemId) {
        return repository.findByMediaItem_Id(mediaItemId);
    }
}
