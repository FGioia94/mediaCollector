package com.mediahub.mediahubspring.exception;

public class GenreNotFoundException extends RuntimeException {
    public GenreNotFoundException(Long id) {
        super("No Genre matches the ID: " + id);
    }

    public GenreNotFoundException(String message) {
        super(message);
    }
}

