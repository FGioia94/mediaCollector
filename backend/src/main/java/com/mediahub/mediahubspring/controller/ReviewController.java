package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.ReviewRequest;
import com.mediahub.mediahubspring.dto.ReviewResponse;
import com.mediahub.mediahubspring.dto.ReviewUpdateRequest;
import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.model.Review;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.MediaItemService;
import com.mediahub.mediahubspring.service.ReviewService;
import com.mediahub.mediahubspring.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService service;
    private final UserService userService;
    private final MediaItemService mediaItemService;

    public ReviewController(ReviewService service,
                            UserService userService,
                            MediaItemService mediaItemService) {
        this.service = service;
        this.userService = userService;
        this.mediaItemService = mediaItemService;
    }

    @PostMapping
    public ReviewResponse add(@Valid @RequestBody ReviewRequest request) {

        User author = userService.get(request.getAuthorId());

        MediaItem mediaItem = mediaItemService.get(request.getMediaItemId());

        Review review = new Review();
        review.setAuthor(author);
        review.setText(request.getText());
        review.setMediaItem(mediaItem);
        review.setRating(request.getRating());

        Review saved = service.addReview(review);

        return toResponse(saved);
    }

    @GetMapping("/all")
    public List<ReviewResponse> getAll() {
        return service.getAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ReviewResponse get(@PathVariable Long id) {
        return toResponse(service.get(id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}")
    public ReviewResponse update(@PathVariable Long id,
                                 @Valid @RequestBody ReviewUpdateRequest request) {

        Review updates = new Review();
        updates.setText(request.getText());
        updates.setRating(request.getRating());

        Review updated = service.update(id, updates);

        return toResponse(updated);
    }


    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getAuthor().getId(),
                review.getText(),
                review.getMediaItem().getId(),
                review.getCreatedAt(),
                review.getRating()
        );
    }
}
