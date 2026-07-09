package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.AuthRequest;
import com.mediahub.mediahubspring.dto.AuthResponse;
import com.mediahub.mediahubspring.dto.ForgotPasswordRequest;
import com.mediahub.mediahubspring.dto.RegisterRequest;
import com.mediahub.mediahubspring.dto.ResetPasswordRequest;
import com.mediahub.mediahubspring.exception.UserNotFoundException;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.security.AuthRateLimiter;
import com.mediahub.mediahubspring.service.PasswordResetService;
import com.mediahub.mediahubspring.service.RoleService;
import com.mediahub.mediahubspring.service.UserService;
import com.mediahub.mediahubspring.security.JwtService;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final RoleService roleService;
    private final PasswordResetService passwordResetService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthRateLimiter authRateLimiter;

    public AuthController(UserService userService,
                          RoleService roleService,
                          PasswordResetService passwordResetService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          AuthRateLimiter authRateLimiter) {
        this.userService = userService;
        this.roleService = roleService;
        this.passwordResetService = passwordResetService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.authRateLimiter = authRateLimiter;
    }

    // ---------------------------------------------------------
    // REGISTER
    // ---------------------------------------------------------
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        authRateLimiter.checkOrThrow("auth-register", servletRequest);

        // Normalize once at the API boundary to keep auth lookups consistent.
        String normalizedEmail = EmailNormalizer.normalize(request.getEmail());
        String normalizedUsername = normalizeUsername(request.getUsername());

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setUsernameValue(normalizedUsername);
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setProfileImage(request.getProfileImage());

        // Default role = USER
        Role userRole = roleService.getByName("USER");
        user.getRoles().add(userRole);

        User saved = userService.addUser(user);

        String token = jwtService.generateToken(saved);

        return new AuthResponse(token, saved.getEmail(), saved.getUsernameValue(), saved.getId(), roleNames(saved));
    }

    // ---------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request, HttpServletRequest servletRequest) {
        authRateLimiter.checkOrThrow("auth-login", servletRequest);

        String normalizedIdentifier = normalizeIdentifier(request.getIdentifier());

        User user;
        try {
            user = userService.getByLoginIdentifier(normalizedIdentifier);
        } catch (UserNotFoundException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User does not exist.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedIdentifier,
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Password is incorrect.");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getUsernameValue(), user.getId(), roleNames(user));
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest servletRequest) {
        authRateLimiter.checkOrThrow("auth-forgot-password", servletRequest);

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
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest servletRequest) {
        authRateLimiter.checkOrThrow("auth-reset-password", servletRequest);

        passwordResetService.resetPassword(request.getToken(), request.getPassword());
        return Map.of("message", "Password updated successfully.");
    }

    private String normalizeIdentifier(String identifier) {
        if (identifier == null) {
            return "";
        }
        String trimmed = identifier.trim();
        if (trimmed.contains("@")) {
            return EmailNormalizer.normalize(trimmed);
        }
        return normalizeUsername(trimmed);
    }

    private String normalizeUsername(String username) {
        if (username == null) {
            return "";
        }
        return username.trim();
    }

    private Set<String> roleNames(User user) {
        return user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
    }
}
