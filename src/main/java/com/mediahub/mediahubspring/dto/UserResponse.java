package com.mediahub.mediahubspring.dto;

import com.mediahub.mediahubspring.model.Role;

import java.time.LocalDateTime;
import java.util.Set;


// IMPORTANT:
// We NEVER include the password nor any other sensitive field in the
// response DTO. This could be easily leaked and is not a good security
// practice even for testing

public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImage;
    private Set<Role> roles;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id,
                        String firstName,
                        String lastName,
                        String email,
                        String profileImage,
                        Set<Role> roles,
                        LocalDateTime createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.profileImage = profileImage;
        this.roles = roles;
        this.createdAt = createdAt;
    }

    // GETTERS

    public Long getId() {
        return this.id;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public String getEmail() {
        return this.email;
    }

    public String getProfileImage() {
        return this.profileImage;
    }

    public Set<Role> getRoles() {
        return this.roles;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }
}
