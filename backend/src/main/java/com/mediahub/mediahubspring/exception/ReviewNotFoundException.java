package com.mediahub.mediahubspring.exception;

public class ReviewNotFoundException extends RuntimeException {
    public ReviewNotFoundException(Long id) {
        super("Review not found: " + id);
    }

    public ReviewNotFoundException(String message) {
        super(message);
    }
}

