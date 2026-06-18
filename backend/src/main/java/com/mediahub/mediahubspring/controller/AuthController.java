package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.AuthRequest;
import com.mediahub.mediahubspring.dto.AuthResponse;
import com.mediahub.mediahubspring.dto.ForgotPasswordRequest;
import com.mediahub.mediahubspring.dto.RegisterRequest;
import com.mediahub.mediahubspring.dto.ResetPasswordRequest;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.PasswordResetService;
import com.mediahub.mediahubspring.service.RoleService;
import com.mediahub.mediahubspring.service.UserService;
import com.mediahub.mediahubspring.security.JwtService;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final RoleService roleService;
    private final PasswordResetService passwordResetService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          RoleService roleService,
                          PasswordResetService passwordResetService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.userService = userService;
        this.roleService = roleService;
        this.passwordResetService = passwordResetService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // ---------------------------------------------------------
    // REGISTER
    // ---------------------------------------------------------
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        // Normalize once at the API boundary to keep auth lookups consistent.
        String normalizedEmail = EmailNormalizer.normalize(request.getEmail());

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setProfileImage(request.getProfileImage());

        // Default role = USER
        Role userRole = roleService.getByName("USER");
        user.getRoles().add(userRole);

        User saved = userService.addUser(user);

        String token = jwtService.generateToken(saved);

        return new AuthResponse(token, saved.getEmail(), saved.getId());
    }

    // ---------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        // Login uses the same normalized identifier used at registration time.
        String normalizedEmail = EmailNormalizer.normalize(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                normalizedEmail,
                        request.getPassword()
                )
        );

        User user = userService.getByEmail(normalizedEmail);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getId());
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetLink = passwordResetService.requestPasswordReset(request.getEmail());
        if (resetLink != null) {
            return Map.of(
                    "message", "SMTP is not configured. Use the provided reset link.",
                    "resetLink", resetLink
            );
        }
        return Map.of("message", "If the account exists, a password reset email has been sent.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getPassword());
        return Map.of("message", "Password updated successfully.");
    }
}
