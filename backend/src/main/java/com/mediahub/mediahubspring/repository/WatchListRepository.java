package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.WatchList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WatchListRepository extends JpaRepository<WatchList, Long> {
    public List<WatchList> findByUser_Id(Long userId);
    boolean existsByUser_IdAndMediaItem_Id(Long userId, Long mediaItemId);
    List<WatchList> findByMediaItem_Id(Long mediaItemId);

}
