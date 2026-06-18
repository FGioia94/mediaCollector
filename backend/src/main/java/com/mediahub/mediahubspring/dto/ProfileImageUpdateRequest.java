package com.mediahub.mediahubspring.dto;

import jakarta.validation.constraints.Size;

public class ProfileImageUpdateRequest {

    @Size(max = 3_000_000, message = "Profile image payload is too large")
    private String profileImage;

    public ProfileImageUpdateRequest() {
    }

    public ProfileImageUpdateRequest(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}