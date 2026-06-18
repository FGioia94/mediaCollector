package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMediaItem_Id(Long mediaItemId);

    List<Review> findByAuthor_Id(Long userId);
}
