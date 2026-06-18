package com.mediahub.mediahubspring.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("No User matches the ID: " + id);
    }

    public UserNotFoundException(String name) {
        super("No User matches the name: " + name);
    }

    public UserNotFoundException() {

    }
}

