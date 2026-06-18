package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.ProfileImageUpdateRequest;
import com.mediahub.mediahubspring.dto.ChangePasswordRequest;
import com.mediahub.mediahubspring.dto.UserResponse;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping({"/me", "/me/"})
    public UserResponse getMe(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return toResponse(user);
    }

    @PutMapping({"/me/image", "/me/image/"})
    public UserResponse updateMyProfileImage(Authentication authentication,
                                             @Valid @RequestBody ProfileImageUpdateRequest request) {
        User user = userService.getByEmail(authentication.getName());
        User updated = userService.updateProfileImage(user.getId(), request.getProfileImage());
        return toResponse(updated);
    }

    @PutMapping({"/me/password", "/me/password/"})
    public Map<String, String> changeMyPassword(Authentication authentication,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        User user = userService.getByEmail(authentication.getName());
        userService.changePassword(user.getId(), request.getCurrentPassword(), request.getNewPassword());
        return Map.of("message", "Password updated successfully.");
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getProfileImage(),
                user.getRoles(),
                user.getCreatedAt());
    }
}