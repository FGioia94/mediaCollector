package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.ReviewRequest;
import com.mediahub.mediahubspring.dto.ReviewUpdateRequest;
import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.model.Review;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.MediaItemService;
import com.mediahub.mediahubspring.service.ReviewService;
import com.mediahub.mediahubspring.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @Mock
    private UserService userService;

    @Mock
    private MediaItemService mediaItemService;

    @InjectMocks
    private ReviewController controller;

    @Test
    void add_shouldMapRatingFromRequest() {
        User author = new User();
        author.setEmail("u@example.com");
        MediaItem media = new MediaItem() {};

        ReviewRequest request = new ReviewRequest(1L, "Great", 2L, 9);

        when(userService.get(1L)).thenReturn(author);
        when(mediaItemService.get(2L)).thenReturn(media);
        when(reviewService.addReview(any(Review.class))).thenAnswer(invocation -> {
            Review r = invocation.getArgument(0);
            r.setAuthor(author);
            r.setMediaItem(media);
            return r;
        });

        controller.add(request);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewService).addReview(captor.capture());
        assertEquals(9, captor.getValue().getRating());
    }

    @Test
    void update_shouldMapRatingFromRequest() {
        ReviewUpdateRequest request = new ReviewUpdateRequest();
        request.setText("Updated text");
        request.setRating(7);

        Review persisted = new Review();
        persisted.setRating(7);
        User author = new User();
        author.setEmail("u@example.com");
        MediaItem media = new MediaItem() {};
        persisted.setAuthor(author);
        persisted.setMediaItem(media);

        when(reviewService.update(any(Long.class), any(Review.class))).thenReturn(persisted);

        controller.update(10L, request);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewService).update(any(Long.class), captor.capture());
        assertEquals(7, captor.getValue().getRating());
    }
}
