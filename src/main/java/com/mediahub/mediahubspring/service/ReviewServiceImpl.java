package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.ReviewNotFoundException;
import com.mediahub.mediahubspring.model.Review;
import com.mediahub.mediahubspring.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository repository;

    public ReviewServiceImpl(ReviewRepository repository) {
        this.repository = repository;
    }

    // -------------------------
    // CRUD
    // -------------------------

    @Override
    public Review addReview(Review review) {
        return repository.save(review);
    }

    @Override
    public Review get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException(id));
    }

    @Override
    public List<Review> getAll() {
        return repository.findAll();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ReviewNotFoundException(id);
        }
        repository.deleteById(id);
    }

    // -------------------------
    // ADVANCED QUERIES
    // -------------------------

    @Override
    public List<Review> getReviewsByMediaItem(Long mediaItemId) {
        return repository.findByMediaItem_Id(mediaItemId);
    }

    @Override
    public List<Review> getReviewsByUser(Long userId) {
        return repository.findByAuthor_Id(userId);
    }

    @Override
    public Review update(Long id, Review updates) {
        Review existing = repository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException(id));

        updateCommonFields(existing, updates);

        return repository.save(existing);
    }

    @Override
    public void updateCommonFields(Review existing, Review updates) {
        if (updates.getText() != null) {
            existing.setText(updates.getText());
        }
        if (updates.getAuthor() != null) {
            existing.setAuthor(updates.getAuthor());
        }
        if (updates.getMediaItem() != null) {
            existing.setMediaItem(updates.getMediaItem());
        }

        if (updates.getRating() != null) {
            existing.setRating(updates.getRating());
        }
    }

}
