package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Review;

import java.util.List;

public interface ReviewService {

    Review addReview(Review review);

    Review get(Long id);

    List<Review> getAll();

    void delete(Long id);

    List<Review> getReviewsByMediaItem(Long mediaItemId);

    List<Review> getReviewsByUser(Long userId);

    Review update(Long id, Review updates);

    void updateCommonFields(Review existing, Review updates);
}
