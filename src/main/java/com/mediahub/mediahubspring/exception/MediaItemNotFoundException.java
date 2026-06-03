package com.mediahub.mediahubspring.exception;

public class MediaItemNotFoundException extends RuntimeException {
    public MediaItemNotFoundException(Long id) {
        super("No MediaItem matches the ID: " + id);
    }

    public MediaItemNotFoundException(String message) {
        super(message);
    }
}

