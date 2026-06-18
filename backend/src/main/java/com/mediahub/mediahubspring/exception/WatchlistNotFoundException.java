package com.mediahub.mediahubspring.exception;

public class WatchlistNotFoundException extends RuntimeException {
    public WatchlistNotFoundException(Long id) {
        super("No WatchList matches the ID: " + id);
    }

    public WatchlistNotFoundException(String message) {
        super(message);
    }
}

