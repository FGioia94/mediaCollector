package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.AuthRequest;
import com.mediahub.mediahubspring.dto.AuthResponse;
import com.mediahub.mediahubspring.dto.RegisterRequest;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.service.RoleService;
import com.mediahub.mediahubspring.service.UserService;
import com.mediahub.mediahubspring.security.JwtService;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final RoleService roleService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          RoleService roleService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.userService = userService;
        this.roleService = roleService;
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

        return new AuthResponse(token, saved.getEmail());
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

        return new AuthResponse(token, user.getEmail());
    }
}
