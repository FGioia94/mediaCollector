package com.mediahub.mediahubspring.exception;

public class RoleNotFoundException extends RuntimeException {
    public RoleNotFoundException(Long id) {
        super("No Role matches the ID: " + id);
    }

    public RoleNotFoundException(String name) {
        super("No Role matches the name: " + name);
    }
}

