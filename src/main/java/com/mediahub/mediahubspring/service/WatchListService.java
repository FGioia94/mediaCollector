package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.WatchList;

import java.util.List;

public interface WatchListService {
    public WatchList addWatchList(WatchList watchList);

    public List<WatchList> getAll();

    public WatchList get(Long id);

    public void delete(Long id);

    public WatchList update(Long id, WatchList updates);

    public List<WatchList> getByUserId(Long id);

    public boolean exists (Long userId, Long mediaItemId);

    List<WatchList> getByMediaItem(Long mediaItemId);
}
